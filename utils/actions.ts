//important
//some revalidations are calling inside the actions so no revalidates in somecomponents,so No need for router.refresh() or revalidatePath() in components if revalidation is already handled inside server action
//also formcomponents using useEffect so though page don't get refresh from there, as we are using inside the aciton funcitons we get to see imidiate changes on page
'use server' //for server actions as these actions run on server but we use them inside the client
import db from '@/utils/db'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import {
  productSchema,
  validateWithZodSchema,
  imageSchema,
} from '@/utils/Schemas'

import { uploadImage } from './supabase'
import { revalidatePath } from 'next/cache'
import { deleteImage } from './supabase'
import { reviewSchema } from '@/utils/Schemas'
import { Cart } from '@prisma/client'

const renderError = (error: unknown): { message: string } => {
  console.log(error)
  return {
    message: error instanceof Error ? error.message : 'An error occurred',
  }
}

const getAuthUser = async () => {
  const user = await currentUser()
  if (!user) {
    throw new Error('You must be logged in to access this route')
  }
  return user
}

export const fetchFeaturedProducts = async () => {
  const products = await db.product.findMany({
    where: {
      featured: true,
    },
  })
  return products
}

export const fetchAllProducts = async ({ search = '' }: { search: string }) => {
  return await db.product.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const fetchSingleProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  })
  if (!product) {
    redirect('/products')
  }
  return product
}

export const createProductAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)

    const file = formData.get('image') as File

    const validatedFields = validateWithZodSchema(productSchema, rawData) //made sure it is of required rules

    const validatedFile = validateWithZodSchema(imageSchema, { image: file }) //made sure it is of required rules
    const fullPath = await uploadImage(validatedFile.image) //uploaded with the help of our supabase client

    await db.product.create({
      data: {
        ...validatedFields,
        image: fullPath,
        clerkId: user.id,
      },
    })
  } catch (error) {
    return renderError(error)
  }
  redirect('/admin/products')
}

const getAdminUser = async () => {
  const user = await getAuthUser()
  if (user.id !== process.env.ADMIN_USER_ID) redirect('/')
  return user
}
// refactor createProductAction

export const fetchAdminProducts = async () => {
  await getAdminUser()
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  return products
}

// Even if only admins can open the page, the server action (deleteProductAction) can still be called separately (like from browser tools or outside scripts).
// So, we check again with getAdminUser() inside the action to protect the backend and stop non-admins from deleting products.

// Page check = frontend protection
// Action check = backend protection (very important)
export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState
  await getAdminUser()
  try {
    const product = await db.product.delete({
      where: {
        id: productId,
      },
    })
    await deleteImage(product.image) //delete image from supabase our backend,
    revalidatePath('/admin/products')
    return { message: 'product removed' }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchAdminProductDetails = async (productId: string) => {
  await getAdminUser()
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  })
  if (!product) redirect('/admin/products')
  return product
}

export const updateProductAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAdminUser() //verifying user is Admin

  try {
    const productId = formData.get('id') as string
    const rawData = Object.fromEntries(formData) //got formdata as object

    const validatedFields = validateWithZodSchema(productSchema, rawData)

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        ...validatedFields,
      },
    })
    revalidatePath(`/admin/products/${productId}/edit`)
    return { message: 'Product updated successfully' }
  } catch (error) {
    return renderError(error)
  }
}

//get the newimage(inside form) ,productid,old image url,,delete old image from supabase,,generate new url for image inside the form,,then update the url to newurl inside the db
export const updateProductImageAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAuthUser()
  try {
    const image = formData.get('image') as File
    const productId = formData.get('id') as string
    const oldImageUrl = formData.get('url') as string

    const validatedFile = validateWithZodSchema(imageSchema, { image })
    //getting url for newimage
    const fullPath = await uploadImage(validatedFile.image)
    //deleting old image
    await deleteImage(oldImageUrl)
    //updating image with newone url
    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        image: fullPath,
      },
    })
    revalidatePath(`/admin/products/${productId}/edit`)
    return { message: 'Product Image updated successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
  const user = await getAuthUser()
  const favorite = await db.favorite.findFirst({
    where: { productId, clerkId: user.id },
    select: { id: true },
  })
  return favorite?.id || null
}

export const toggleFavoriteAction = async (prevState: {
  productId: string
  favoriteId: string | null
  pathname: string
}) => {
  const user = await getAuthUser()
  const { productId, favoriteId, pathname } = prevState
  try {
    if (favoriteId) {
      //if product is already in fav  table ,,it is deleted
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      })
    } else {
      // if product is not in fav table it has to be created
      await db.favorite.create({
        data: {
          productId,
          clerkId: user.id,
        },
      })
    }
    revalidatePath(pathname) //to refresh cached data,it ensures that the latest data from the database or API is displayed without requiring a full page reload.
    return { message: favoriteId ? 'Removed from Faves' : 'Added to Faves' }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchUserFavorites = async () => {
  const user = await getAuthUser()
  const favorites = await db.favorite.findMany({
    where: {
      clerkId: user.id,
    },
    include: {
      product: true,
    },
  })
  return favorites
}

export const createReviewAction = async (
  prevState: any,
  formData: FormData
) => {
  const user = await getAuthUser()
  try {
    const rawData = Object.fromEntries(formData)

    const validatedFields = validateWithZodSchema(reviewSchema, rawData)

    await db.review.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
      },
    })
    revalidatePath(`/products/${validatedFields.productId}`)
    return { message: 'Review submitted successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchProductReviews = async (productId: string) => {
  const reviews = await db.review.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return reviews
}
export const fetchProductReviewsByUser = async () => {
  const user = await getAuthUser()
  const reviews = await db.review.findMany({
    where: {
      clerkId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      product: {
        select: {
          image: true,
          name: true,
        },
      },
    },
  })
  return reviews
}
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState
  const user = await getAuthUser()

  try {
    await db.review.delete({
      where: {
        id: reviewId,
        clerkId: user.id,
      },
    })

    revalidatePath('/reviews')
    return { message: 'Review deleted successfully' }
  } catch (error) {
    return renderError(error)
  }
}
export const findExistingReview = async (userId: string, productId: string) => {
  return db.review.findFirst({
    where: {
      clerkId: userId,
      productId,
    },
  })
}

export const fetchProductRating = async (productId: string) => {
  const result = await db.review.groupBy({
    by: ['productId'],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      productId,
    },
  }) //give average value for the  given product

  // empty array if no reviews
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0,
  }
}

export const fetchCartItems = async () => {
  const { userId } = auth()

  const cart = await db.cart.findFirst({
    where: {
      clerkId: userId ?? '',
    },
    select: {
      numItemsInCart: true,
    },
  })
  return cart?.numItemsInCart || 0
}

const fetchProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    //fetching product

    where: {
      id: productId,
    },
  })

  if (!product) {
    //if product is not existed
    throw new Error('Product not found') //The function immediately stops executing, and nothing after that line will run.
  }
  return product
}

//When fetching a cart, also fetch the cart items.
//And for each cart item, also fetch its product info.
const includeProductClause = { cartItems: { include: { product: true } } }

export const fetchOrCreateCart = async ({
  userId,
  errorOnFailure = false,
}: {
  userId: string
  errorOnFailure?: boolean
}) => {
  let cart = await db.cart.findFirst({
    where: {
      clerkId: userId,
    },
    include: includeProductClause,
  })

  //if cart is not present and also there is failure
  if (!cart && errorOnFailure) {
    throw new Error('Cart not found')
  }
  //no failure but cart is not present then create a one

  if (!cart) {
    cart = await db.cart.create({
      data: { clerkId: userId },
      include: includeProductClause,
    })
  }

  return cart
}

const updateOrCreateCartItem = async ({
  productId,
  cartId,
  amount,
}: {
  productId: string
  cartId: string
  amount: number
}) => {
  let cartItem = await db.cartItem.findFirst({
    where: {
      productId,
      cartId,
    },
  })

  if (cartItem) {
    cartItem = await db.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        amount: cartItem.amount + amount,
      },
    })
  } else {
    cartItem = await db.cartItem.create({
      data: { amount, productId, cartId },
    })
  }
}

//first get all the user's cartItems, them calculate noofitems,cartTotal,tax,orderTotal  to updatecart
export const updateCart = async (cart: Cart) => {
  const cartItems = await db.cartItem.findMany({
    where: {
      cartId: cart.id,
    },
    include: {
      product: true, // Include the related product
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  let numItemsInCart = 0
  let cartTotal = 0

  for (const item of cartItems) {
    numItemsInCart += item.amount
    cartTotal += item.amount * item.product.price
  }
  const tax = cart.taxRate * cartTotal
  const shipping = cartTotal ? cart.shipping : 0
  const orderTotal = cartTotal + tax + shipping

  const currentCart = await db.cart.update({
    where: {
      id: cart.id,
    },

    data: {
      numItemsInCart,
      cartTotal,
      tax,
      orderTotal,
    },
    include: includeProductClause,
  })
  return { currentCart, cartItems }
}

//table overview
//1) CART table contains user's final amount,cost,tax,et...
//2) CARTITEMS contains indvidual  cartId,productId, amount

//this is the heart for all the cart actions
//first --- whenever anyproduct value is changed and clicked on add to cart,we have to call the AddtoCart Action
//
//first get the user details,    if user not signed in transfer user to signin page ,,,else store user's details in 'user' variable
//second ---from the form fetch the current values on form i.e.. productId,Amount(count)
// third -- check whether product is present or not //admin may delete it inbetween
//fourth -- fetch the cart details if cart is not present for user createone
//fifth  -- update the CartItem for the productId,CartId,  if not present --createOne with current values
//sixth  --update cart

export const addToCartAction = async (prevState: any, formData: FormData) => {
  const user = await getAuthUser()
  try {
    const productId = formData.get('productId') as string
    const amount = Number(formData.get('amount')) //it means count
    await fetchProduct(productId) //check if product is present or not cz meanwhile admin may dlel it
    const cart = await fetchOrCreateCart({ userId: user.id }) //return the cart and that result stored in the cart
    await updateOrCreateCartItem({ productId, cartId: cart.id, amount })
    await updateCart(cart)
  } catch (error) {
    return renderError(error)
  }
  redirect('/cart')
}

//steps for removeCartItem
//first fetch the userid(form user) and cartid(from formData)
//after fetch the  create or create the cart if not present t
//delete row form cartItem where id=cartItemid -->this is the original function
// update the cart for given cart.id
export const removeCartItemAction = async (
  prevState: any,
  formData: FormData
) => {
  const user = await getAuthUser()

  try {
    const cartItemId = formData.get('id') as string
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    })
    await db.cartItem.delete({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    })

    await updateCart(cart)

    revalidatePath('/cart') //revalidates to show the fresh changes
    return { message: 'Item removed from cart' }
  } catch (error) {
    return renderError(error)
  }
}

//steps
//first fetch userId(for updating cart),cartItemId(updating cartItem)
//update the cartItem with updated amount,
//update else create Cart for given userId fetching data form cartItem using
export const updateCartItemAction = async ({
  amount,
  cartItemId,
}: {
  amount: number
  cartItemId: string
}) => {
  const user = await getAuthUser()

  try {
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    })
    await db.cartItem.update({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      data: {
        amount,
      },
    })
    await updateCart(cart)
    revalidatePath('/cart')
    return { message: 'cart updated' }
  } catch (error) {
    return renderError(error)
  }
}

// // Add the export for createOrderAction if missing
// export function createOrderAction() {
//   // Implementation of the action
// }

//createOrderAction fetches user then fetches user's cart (details,like no.of.items,tax,sum,total,shipping etc..) for orderplacement
// Before creating a new order with user's cart, it cleans up previous unpaid (leftover) orders for this user to avoid duplicates or mess.
//redirect to paymentPage after order

export const createOrderAction = async (prevState: any, formData: FormData) => {
  const user = await getAuthUser()

  let orderId: null | string = null
  let cartId: null | string = null
  try {
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    })

    cartId = cart.id
    await db.order.deleteMany({
      where: {
        clerkId: user.id,
        isPaid: false,
      },
    })

    const order = await db.order.create({
      data: {
        clerkId: user.id,
        products: cart.numItemsInCart,
        orderTotal: cart.orderTotal,
        tax: cart.tax,
        shipping: cart.shipping,
        email: user.emailAddresses[0].emailAddress,
      },
    })
    orderId = order.id
  } catch (error) {
    return renderError(error)
  }
  redirect(`/checkout?orderId=${orderId}&cartId=${cartId}`)
}

export const fetchUserOrders = async () => {
  const user = await getAuthUser() //current user's id
  const orders = await db.order.findMany({
    where: {
      clerkId: user.id,
      isPaid: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return orders
}

export const fetchAdminOrders = async () => {
  const user = await getAdminUser()

  const orders = await db.order.findMany({
    where: {
      isPaid: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return orders
}
