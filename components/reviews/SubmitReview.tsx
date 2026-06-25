'use client'
import { useState } from 'react'
import { SubmitButton } from '@/components/form/Buttons'
import FormContainer from '@/components/form/FormContainer'
import { Card } from '@/components/ui/card'
import RatingInput from '@/components/reviews/RatingInput'

import TextAreaInput from '@/components/form/TextAreaInput'

import { Button } from '@/components/ui/button'

import { createReviewAction } from '@/utils/actions'

import { useUser } from '@clerk/nextjs'

function SubmitReview({ productId }: { productId: string }) {
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false)
  const { user } = useUser()
  return (
    <div>
      <Button
        size="lg"
        className="capitalize"
        onClick={() => setIsReviewFormVisible((prev) => !prev)} //forflipping the visibility of form
      >
        leave review
      </Button>

      {isReviewFormVisible && (
        <Card className="p-8 mt-8">
          <FormContainer action={createReviewAction}>
            <input type="hidden" name="productId" value={productId} />
            <input
              type="hidden"
              name="authorName"
              value={user?.firstName || 'user'}
            />
            <input
              type="hidden"
              name="authorImageUrl"
              value={user?.imageUrl || ''}
            />

            <RatingInput name="rating" />

            <TextAreaInput
              name="comment"
              labelText="feedback"
              defaultValue="Outstanding product!!!"
            />

            <SubmitButton className="mt-4" />
          </FormContainer>
        </Card>
      )}
    </div>
  )
}

export default SubmitReview
// The form sends the data to createReview() function.That function uses Zod schema → to check if data is valid.
// If valid, it adds review into the database table (review table)
//It triggers a revalidation (in Next.js, like revalidatePath() or similar).
// This means → the page (or certain part) is re-fetched from server. to reflect LatestCahnges
