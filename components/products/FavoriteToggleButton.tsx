import { auth } from '@clerk/nextjs/server'
import { CardSignInButton } from '../form/Buttons'
import { fetchFavoriteId } from '@/utils/actions'
import FavoriteToggleForm from './FavoriteToggleForm'
//revalidate is done with this function so updates are visible
async function FavoriteToggleButton({ productId }: { productId: string }) {
  const { userId } = auth()
  if (!userId) return <CardSignInButton />
  const favoriteId = await fetchFavoriteId({ productId })

  return <FavoriteToggleForm favoriteId={favoriteId} productId={productId} />
}
export default FavoriteToggleButton
