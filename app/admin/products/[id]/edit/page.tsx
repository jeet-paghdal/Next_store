import { fetchAdminProductDetails, updateProductAction } from '@/utils/actions'
import FormContainer from '@/components/form/FormContainer'
import FormInput from '@/components/form/FormInput'
import PriceInput from '@/components/form/PriceInput'
import TextAreaInput from '@/components/form/TextAreaInput'
import { SubmitButton } from '@/components/form/Buttons'
import CheckboxInput from '@/components/form/CheckboxInput'
import ImageInputContainer from '@/components/form/ImageInputContainer'
import { updateProductImageAction } from '@/utils/actions'

async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  const product = await fetchAdminProductDetails(id)

  const { name, company, description, featured, price } = product
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">update product</h1>
      \
      <div className="border p-8 rounded-md">
        {/* Image Input Container ,//get the newimage(inside form) ,productid,old image url,,delete old image from supabase,,generate new url for image inside the form,,then update the url to newurl inside the db and revalidated to edit page of product so you can see*/}
        <ImageInputContainer
          action={updateProductImageAction}
          name={name}
          image={product.image}
          text="update image"
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="url" value={product.image} />
        </ImageInputContainer>
      </div>
      <FormContainer action={updateProductAction}>
        <div className="grid gap-4 md:grid-cols-2 my-4">
          <input type="hidden" name="id" value={id} />
          <FormInput
            type="text"
            name="name"
            label="product name"
            defaultValue={name}
          />
          <FormInput
            type="text"
            name="company"
            label="company"
            defaultValue={company}
          />

          <PriceInput defaultValue={price} />
        </div>
        <TextAreaInput
          name="description"
          labelText="product description"
          defaultValue={description}
        />
        <div className="mt-6">
          <CheckboxInput
            name="featured"
            label="featured"
            defaultChecked={featured}
          />
        </div>
        <SubmitButton text="update product" className="mt-8" />
      </FormContainer>
    </section>
  )
}
export default EditProductPage

//after submit button page is revalidated to edit page of that product after updating

//two different forms
//image conatiner shows old image and have change to upload/update new image
//form container shows old data and have chance to update and submit the new date
