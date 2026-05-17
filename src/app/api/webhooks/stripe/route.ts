import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_placeholder");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Webhookシークレットまたは署名が不足しています。" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature securely
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Signature Verification Failed:`, err.message);
      return NextResponse.json(
        { error: `Webhook署名検証に失敗しました: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`Stripe Webhook Received Event Type: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.warn("Checkout Completed Event is missing userId metadata.");
          break;
        }

        // 1. Upgrade user to SA active member & store Stripe identifiers in profiles
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_sa_member: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          console.error("Failed to update user profile upon checkout:", profileError);
          return NextResponse.json({ error: "プロフィール更新に失敗しました。" }, { status: 500 });
        }

        // 2. Fetch subscription details from Stripe to log current period end
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // 3. Log subscription details in central subscriptions table
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            product_id: "prod_sa_monthly",
            status: "active",
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,product_id"
          });

        if (subError) {
          console.error("Failed to insert subscription record:", subError);
        }

        console.log(`Successfully upgraded User ID ${userId} to SA Monthly Plan!`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const isSaMember = status === "active" || status === "trialing";
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Update profile membership status dynamically based on Stripe subscription state
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_sa_member: isSaMember,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (profileError) {
          console.error("Failed to update profile subscription status:", profileError);
        }

        // Update central subscriptions table log
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: isSaMember ? "active" : "canceled",
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId); // Custom tracking or matching

        console.log(`Stripe Subscription Updated for customer ${customerId}. Membership Active: ${isSaMember}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        // Downgrade profile to general member
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_sa_member: false,
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (profileError) {
          console.error("Failed to deactivate profile on delete:", profileError);
        }

        // Update subscription log to expired
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", (
            await supabaseAdmin.from("profiles").select("id").eq("stripe_customer_id", customerId).single()
          ).data?.id || "");

        console.log(`Stripe Subscription Terminated/Deleted for customer ${customerId}. User downgraded.`);
        break;
      }

      default: {
        console.log(`Unhandled webhook event type: ${event.type}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook Handler Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhookの処理に失敗しました。" },
      { status: 500 }
    );
  }
}
