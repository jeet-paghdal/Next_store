import FeaturedProducts from '@/components/home/FeaturedProducts'
import Hero from '@/components/home/Hero'
import LoadingContainer from '@/components/global/LoadingContainer'
import { Suspense } from 'react'
function HomPage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<LoadingContainer />}>
        {/* FeaturedProducts may take time to load.While waiting, show LoadingContainer as a loading screen.Once loaded, show the real products. */}
        <FeaturedProducts />
      </Suspense>
    </>
  )
}
export default HomPage
