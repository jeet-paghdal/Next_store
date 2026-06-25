//if you don’t manually pass parameters(i.e came through the link), Next.js automatically parses the URL and injects them into the component via searchParams.
//else take the parameters

import ProductsContainer from '@/components/products/ProductsContainer'
//url contains two parameters one--layout,,two search
async function ProductsPage({
  searchParams,
}: {
  searchParams: { layout?: string; search?: string }
}) {
  const layout = searchParams.layout || 'grid' //layout is either grid or list type
  const search = searchParams.search || '' // initially null so displays all the products,,search is for product type, bed/shoes/sofa....
  return (
    <>
      <ProductsContainer layout={layout} search={search} />
    </>
  )
}
export default ProductsPage
