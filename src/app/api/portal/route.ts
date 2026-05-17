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

    // Query subscriptions table to retrieve stripe_customer_id
    const { data: subscription, error: dbError } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (dbError || !subscription || !subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: "Stripe顧客IDが見つかりませんでした。まだ決済が完了していない可能性があります。" },
        { status: 404 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/mypage`,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID || "bpc_1TY42y7sway2AG6Jv0CIf7JN",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json(
      { error: error.message || "ポータルセッションの作成に失敗しました。" },
      { status: 500 }
    );
  }
}
