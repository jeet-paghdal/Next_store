import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/products(.*)', '/about']) //anyone can see whether non-user, user, admin
const isAdminRoute = createRouteMatcher(['/admin(.*)']) //only admin can see

export default clerkMiddleware(async (auth, req) => {
  // console.log(auth().userId);

  const isAdminUser = auth().userId === process.env.ADMIN_USER_ID //fetchs current user id and then check with amin user if ,

  //If the request is for an admin URL but the user is not the admin, redirect them to /.
  if (isAdminRoute(req) && !isAdminUser) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  //   For any route not marked public (and not admin), require login.

  // auth().protect() will redirect to sign‑in if the user isn’t logged in.

  if (!isPublicRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
