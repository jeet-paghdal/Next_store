import { createClient } from '@supabase/supabase-js'

const bucket = 'main-bucket'

// Create a single supabase client for interacting with your database ,it is made from the url and key parameters we kept in eve variables
export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
)

export const uploadImage = async (image: File) => {
  const timestamp = Date.now()
  // const newName = `/users/${timestamp}-${image.name}`;
  const newName = `${timestamp}-${image.name}` //assigning name to image

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(newName, image, { cacheControl: '3600' })
  if (!data) throw new Error('Image upload failed')
  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl // returning public url for image
}

export const deleteImage = (url: string) => {
  const imageName = url.split('/').pop()
  if (!imageName) throw new Error('Invalid URL')
  return supabase.storage.from(bucket).remove([imageName])
}
