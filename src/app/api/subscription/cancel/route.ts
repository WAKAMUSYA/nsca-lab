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
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

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
