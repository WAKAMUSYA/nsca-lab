import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_placeholder");

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーID (userId) が必要です。" },
        { status: 400 }
      );
    }

    // Query active subscription from Supabase
    const { data: subscription, error: dbError } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (dbError || !subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: "アクティブなサブスクリプションが見つかりませんでした。" },
        { status: 404 }
      );
    }

    // Update Stripe subscription to cancel at period end
    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      
      if (stripeSub.status === "canceled") {
        // If already canceled on Stripe, sync local DB immediately
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("stripe_subscription_id", subscription.stripe_subscription_id);

        return NextResponse.json({ success: true, message: "すでに解約済みです。" });
      }

      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    } catch (stripeError: any) {
      if (stripeError.message && stripeError.message.includes("canceled subscription")) {
        // Fallback: If Stripe throws "canceled subscription" error, sync DB and succeed gracefully
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("stripe_subscription_id", subscription.stripe_subscription_id);

        return NextResponse.json({ success: true, message: "すでに解約済みでしたので、データを同期しました。" });
      }
      throw stripeError;
    }

    // Update local database status to "canceled" (meaning cancel pending/scheduled)
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("stripe_subscription_id", subscription.stripe_subscription_id);

    if (updateError) {
      console.error("Failed to update local subscription status to canceled:", updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription Cancel Error:", error);
    return NextResponse.json(
      { error: error.message || "解約処理に失敗しました。" },
      { status: 500 }
    );
  }
}
