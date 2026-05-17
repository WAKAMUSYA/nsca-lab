import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_placeholder");

export async function POST(req: Request) {
  try {
    const { userId, email, priceId } = await req.json();

    if (!userId || !email || !priceId) {
      return NextResponse.json(
        { error: "必須項目 (userId, email, priceId) が不足しています。" },
        { status: 400 }
      );
    }

    // Resolve base domain prioritizing NEXT_PUBLIC_SITE_URL or origin
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

    // Use STRIPE_SA_MONTHLY_PRICE_ID if configured, else fallback to passed priceId
    const resolvedPriceId = process.env.STRIPE_SA_MONTHLY_PRICE_ID || priceId;

    // Create Stripe Checkout Session with specific Strength Arts metadata specs
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: email,
      success_url: `${baseUrl}/mypage?success=true`,
      cancel_url: `${baseUrl}/mypage?canceled=true`,
      metadata: {
        supabase_user_id: userId,
        product_key: "strength_arts_member",
      },
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
          product_key: "strength_arts_member",
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Stripeセッションの作成に失敗しました。" },
      { status: 500 }
    );
  }
}
