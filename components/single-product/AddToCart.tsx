'use client'
import { useState } from 'react'
import SelectProductAmount from './SelectProductAmount'
import { Mode } from './SelectProductAmount'
import FormContainer from '../form/FormContainer'
import { SubmitButton } from '../form/Buttons'
import { addToCartAction } from '@/utils/actions'
import { useAuth } from '@clerk/nextjs'
import { ProductSignInButton } from '../form/Buttons'

function AddToCart({ productId }: { productId: string }) {
  const [amount, setAmount] = useState(1) //count
  const { userId } = useAuth()

  return (
    <div className="mt-4">
      {/* for selecting quantity  */}
      <SelectProductAmount
        mode={Mode.SingleProduct} //telling to the function that it SignleProduct  mode
        amount={amount}
        setAmount={setAmount}
      />

      {userId ? (
        <FormContainer action={addToCartAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="amount" value={amount} />
          <SubmitButton text="add to cart" size="default" className="mt-8" />
        </FormContainer>
      ) : (
        <ProductSignInButton />
      )}
    </div>
  )
}
export default AddToCart
