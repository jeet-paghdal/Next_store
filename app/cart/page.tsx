import CartItemsList from '@/components/cart/CartItemsList'
import CartTotals from '@/components/cart/CartTotals'
import SectionTitle from '@/components/global/SectionTitle'
import { fetchOrCreateCart, updateCart } from '@/utils/actions'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
async function CartPage() {
  //find userId and CartId for accessing CART and CART_TABLE
  //fetch or create the cart for given userid

  const { userId } = auth()
  if (!userId) redirect('/')

  const previousCart = await fetchOrCreateCart({ userId }) //createone for the user if not present

  const { cartItems, currentCart } = await updateCart(previousCart) //using the cartid from cart,it fetches all cartItems and updates the cart,return cartItems and Cart

  if (cartItems.length === 0) {
    return <SectionTitle text="Empty cart" />
  }

  return (
    <>
      <SectionTitle text="Shopping Cart" />

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        {/* first portion */}

        <div className="lg:col-span-8">
          <CartItemsList cartItems={cartItems} />
        </div>

        {/* second portion */}

        <div className="lg:col-span-4 lg:pl-4">
          <CartTotals cart={currentCart} />
        </div>
      </div>
    </>
  )
}
export default CartPage
