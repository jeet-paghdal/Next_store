import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LuAlignLeft } from 'react-icons/lu'
import Link from 'next/link'
import { Button } from '../ui/button'
import { links } from '@/utils/links'
import UserIcon from './UserIcon'
import SignOutLink from './SignOutLink'
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

function LinksDropdown() {
  const { userId } = auth()
  const isAdmin = userId === process.env.ADMIN_USER_ID
  return (
    <DropdownMenu>
      {/* This is the button that shows the menu. It has an icon and user image. */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-4 max-w-[100px]">
          <LuAlignLeft className="w-6 h-6" />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>

      {/* This is the dropdown that appears when the button is clicked.It shows different items based on whether the user is signed in or not. */}
      <DropdownMenuContent className="w-48" align="start" sideOffset={10}>
        {/* Shows Login and Register buttons using Clerk popups. */}
        <SignedOut>
          <DropdownMenuItem>
            <SignInButton mode="modal">
              <button className="w-full text-left">Login</button>
            </SignInButton>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignUpButton mode="modal">
              <button className="w-full text-left">Register</button>
            </SignUpButton>
          </DropdownMenuItem>
        </SignedOut>

        {/*  For signnedIn user Loops over links and shows them.If a link is 'dashboard', it’s shown only if the user is admin.*/}
        <SignedIn>
          {links.map((link) => {
            if (link.label === 'dashboard' && !isAdmin) return null //admin dashboard is restricted
            return (
              <DropdownMenuItem key={link.href}>
                <Link href={link.href} className="capitalize w-full">
                  {link.label}
                </Link>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <SignOutLink />
          </DropdownMenuItem>
        </SignedIn>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export default LinksDropdown
