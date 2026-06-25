'use client'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'

import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'

// Get the admin's Stripe account → So payments go to the admin.
// Use useSearchParams → Extract Order ID and Cart ID from the URL.
// Client needs clientSecret to make the payment.
// The client requests the server for clientSecret, sending Cart ID & Order ID.
// EmbeddedCheckoutProvider → Connects Stripe + payment UI, using: Public Stripe Key.....ClientSecret (for secure payment)......EmbeddedCheckout → Shows Stripe’s checkout form for payment.

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const cartId = searchParams.get('cartId')

  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session post to the page api/payment
    const response = await axios.post('/api/payment', {
      orderId: orderId,
      cartId: cartId,
    })
    return response.data.clientSecret
  }, [])

  const options = { fetchClientSecret }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

// //createOrderAction	Creates order + cart, redirects to /checkout
// /checkout/page.tsx	Calls /api/payment, shows Stripe checkout
// /api/payment	Creates Stripe session, returns client secret
// Stripe Embedded Checkout	Stripe UI handles payment
// /api/confirm	Marks order as paid and deletes cart after successful payment
