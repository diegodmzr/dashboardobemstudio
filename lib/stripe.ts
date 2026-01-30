import Stripe from 'stripe';

// Prevent build failures if variable is missing (it will fail at runtime if not set)
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_build_placeholder";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️ STRIPE_SECRET_KEY is missing. Using placeholder for build.");
}

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-09-30.acacia' as any,
    typescript: true,
});
