'use client'
import { adminLinks } from '@/utils/links'

import Link from 'next/link'

import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

function Sidebar() {
  const pathname = usePathname() //current path url

  return (
    <aside>
      {adminLinks.map((link) => {
        const isActivePage = pathname === link.href
        const variant = isActivePage ? 'default' : 'ghost'
        return (
          <Button
            asChild
            className="w-full mb-2 capitalize font-normal justify-start"
            variant={variant}
          >
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          </Button>
        )
      })}
    </aside>
  )
}
export default Sidebar
//if varient ==active -->highlighted

// we don’t have a page.tsx directly under admin/, so:
// Visiting /admin:Renders admin/layout.tsx
// Shows <Sidebar /> and the layout
// But no content in {children} → because there's no admin/page.tsx
// That's why you're seeing the sidebar but no page content — exactly as you described.
