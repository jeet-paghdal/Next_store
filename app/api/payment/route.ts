import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

import { type NextRequest } from 'next/server'
import db from '@/utils/db'

export const POST = async (req: NextRequest) => {
  const requestHeaders = new Headers(req.headers)

  const origin = requestHeaders.get('origin')

  const { orderId, cartId } = await req.json()

  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
  })

  const cart = await db.cart.findUnique({
    where: { id: cartId },
    include: { cartItems: { include: { product: true } } },
  })

  //  not just getting the cart, but also:   All the cartItems inside that cart. And for each cart item, you’re also including its related product info.
  //simply means extracting cartItems details for this order, using only cart database,

  if (!order || !cart) {
    return Response.json(null, {
      status: 404,
      statusText: 'Not Found',
    })
  }

  //line_items contains an array of all the cart items, where each item has the quantity, name, image, and price (in cents) — all formatted in the way Stripe Checkout expects.
  const line_items = cart.cartItems.map((cartItem) => {
    return {
      quantity: cartItem.amount,
      price_data: {
        currency: 'usd',
        product_data: {
          name: cartItem.product.name,
          images: [cartItem.product.image],
        },
        unit_amount: cartItem.product.price * 100, // price in cents stripe accepts in smallest unit possible
      },
    }
  })

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      metadata: { orderId, cartId },
      line_items: line_items,
      mode: 'payment',
      return_url: `${origin}/api/confirm?session_id={CHECKOUT_SESSION_ID}`,
    })

    return Response.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.log(error)

    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }
}

// ui_mode: 'embedded': Says the checkout will be shown inside your app, not on Stripe's site.
// metadata: Sends the orderId and cartId along with the session (for tracking purpose).
// line_items: List of items in the cart (you already formatted this earlier).
// mode: 'payment': Says this is a one-time payment (not a subscription).
// return_url: After successful payment, Stripe will redirect back to this URL. {CHECKOUT_SESSION_ID} is filled by Stripe.
// Stripe responds with a checkout session including a client_secret.

// return Response.json({ clientSecret: session.client_secret })
