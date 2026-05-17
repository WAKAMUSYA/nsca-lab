import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_placeholder");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Crash-proof date parsing helper to guarantee "Invalid time value" is never thrown
function parseSafeDate(value: any): string {
  const fallback = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default fallback: 30 days
  if (value === null || value === undefined) {
    return fallback;
  }
  try {
    let parsed: number;
    if (typeof value === "number") {
      // Convert Unix timestamp in seconds to milliseconds
      parsed = value < 10000000000 ? value * 1000 : value;
    } else if (typeof value === "string") {
      const num = Number(value);
      if (!isNaN(num)) {
        parsed = num < 10000000000 ? num * 1000 : num;
      } else {
        parsed = Date.parse(value);
      }
    } else {
      return fallback;
    }

    if (isNaN(parsed)) {
      return fallback;
    }
    return new Date(parsed).toISOString();
  } catch {
    return fallback;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    if (!signature || !webhookSecret) {
      console.warn("Stripe Webhook Warning: Missing signature or webhook secret.");
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

    console.log(`[Stripe Webhook Legacy Path] Received Event Type: ${event.type}`);

    // Standardize user and subscription mapping across events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Support both old and new metadata keys for maximum compatibility
        const userId = session.metadata?.supabase_user_id || session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.warn("Checkout Completed Event skipped: missing user identification metadata.");
          break;
        }

        let periodEnd = parseSafeDate(null);
        if (subscriptionId) {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          periodEnd = parseSafeDate(subscription?.current_period_end);
        }

        // 1. Upsert subscription record with exact requested fields
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            product_key: "strength_arts_member",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "active",
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,product_key"
          });

        if (subError) {
          console.error("Failed to upsert subscription record:", subError);
          return NextResponse.json({ error: "サブスクリプション情報の保存に失敗しました。" }, { status: 500 });
        }

        // 2. Upgrade user profile to SA active member
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_sa_member: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          console.error("Failed to update user profile upon checkout:", profileError);
          return NextResponse.json({ error: "プロフィール更新に失敗しました。" }, { status: 500 });
        }

        console.log(`Successfully upgraded User ID ${userId} to SA Monthly Plan via legacy path!`);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const isSaMember = status === "active" || status === "trialing";
        const isCanceledPending = subscription.cancel_at_period_end === true;
        const periodEnd = parseSafeDate(subscription?.current_period_end);

        // Retrieve user_id from metadata or database lookup
        let userId = subscription.metadata?.supabase_user_id || subscription.metadata?.userId;
        if (!userId) {
          const { data: subRec } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
            .maybeSingle();
          userId = subRec?.user_id;
        }

        if (userId) {
          // Upsert central subscription record
          await supabaseAdmin
            .from("subscriptions")
            .upsert({
              user_id: userId,
              product_key: "strength_arts_member",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: isCanceledPending ? "canceled" : (isSaMember ? "active" : status),
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id,product_key"
            });

          // Sync dynamic member profile gating
          await supabaseAdmin
            .from("profiles")
            .update({
              is_sa_member: isSaMember,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          console.log(`Processed subscription updated for customer ${customerId} (User: ${userId}). Member: ${isSaMember}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;

        let userId = subscription.metadata?.supabase_user_id || subscription.metadata?.userId;
        if (!userId) {
          // Look up in subscriptions table
          const { data: subRec } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .limit(1)
            .maybeSingle();
          userId = subRec?.user_id;
        }

        if (userId) {
          // Downgrade subscription record status
          await supabaseAdmin
            .from("subscriptions")
            .upsert({
              user_id: userId,
              product_key: "strength_arts_member",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: "expired",
              current_period_end: parseSafeDate(subscription?.current_period_end),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id,product_key"
            });

          // Revoke active member gating in profile
          await supabaseAdmin
            .from("profiles")
            .update({
              is_sa_member: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          console.log(`Processed subscription deletion/cancellation for user: ${userId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        if (subscriptionId) {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          const periodEnd = parseSafeDate(subscription?.current_period_end);
          
          let userId = subscription.metadata?.supabase_user_id || subscription.metadata?.userId;
          if (!userId) {
            const { data: subRec } = await supabaseAdmin
              .from("subscriptions")
              .select("user_id")
              .eq("stripe_customer_id", customerId)
              .limit(1)
              .maybeSingle();
            userId = subRec?.user_id;
          }

          if (userId) {
            await supabaseAdmin.from("subscriptions").upsert({
              user_id: userId,
              product_key: "strength_arts_member",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: "active",
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id,product_key"
            });

            await supabaseAdmin.from("profiles").update({
              is_sa_member: true,
              updated_at: new Date().toISOString(),
            }).eq("id", userId);

            console.log(`Invoice payment succeeded via legacy: Maintained SA membership for user ${userId}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        let userId = null;
        const { data: subRec } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .limit(1)
          .maybeSingle();
        userId = subRec?.user_id;

        if (userId) {
          await supabaseAdmin.from("subscriptions").upsert({
            user_id: userId,
            product_key: "strength_arts_member",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "past_due",
            current_period_end: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,product_key"
          });

          await supabaseAdmin.from("profiles").update({
            is_sa_member: false,
            updated_at: new Date().toISOString(),
          }).eq("id", userId);

          console.warn(`Invoice payment failed via legacy: Suspended SA membership for user ${userId}`);
        }
        break;
      }

      default: {
        console.log(`Unhandled webhook event type: ${event.type}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook Legacy Handler Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhookの処理に失敗しました。" },
      { status: 500 }
    );
  }
}
