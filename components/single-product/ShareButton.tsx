'use client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '../ui/button'
import { LuShare2 } from 'react-icons/lu'

import {
  WhatsappShareButton,
  EmailShareButton,
  LinkedinShareButton,
  WhatsappIcon,
  EmailIcon,
  LinkedinIcon,
} from 'react-share'

function ShareButton({ productId, name }: { productId: string; name: string }) {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL
  const shareLink = `${url}/products/${productId}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="p-2">
          <LuShare2 />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        className="flex items-center gap-x-2 justify-center w-full"
      >
        <WhatsappShareButton url={shareLink} title={name}>
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>

        <LinkedinShareButton url={shareLink} title={name}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <EmailShareButton url={shareLink} subject={name}>
          <EmailIcon size={32} round />
        </EmailShareButton>
      </PopoverContent>
    </Popover>
  )
}
export default ShareButton

// t takes the website URL from .env and adds /products/{productId} to make the full product link.
