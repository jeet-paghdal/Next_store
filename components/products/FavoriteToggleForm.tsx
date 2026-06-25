'use client'
import { usePathname } from 'next/navigation'
import FormContainer from '../form/FormContainer'
import { toggleFavoriteAction } from '@/utils/actions'
import { CardSubmitButton } from '../form/Buttons'

type FavoriteToggleFormProps = {
  productId: string
  favoriteId: string | null
}

function FavoriteToggleForm({
  productId,
  favoriteId,
}: FavoriteToggleFormProps) {
  const pathname = usePathname()

  const toggleAction = toggleFavoriteAction.bind(null, {
    productId,
    favoriteId,
    pathname,
  }) //string of wheter added or deleted is stored here

  return (
    <FormContainer action={toggleAction}>
      <CardSubmitButton isFavorite={favoriteId ? true : false} />{' '}
      {/* update icon, based on whether the product is a favorite or not. 8*/}
    </FormContainer>
  )
}
export default FavoriteToggleForm
