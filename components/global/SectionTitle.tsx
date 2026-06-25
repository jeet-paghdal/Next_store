import { Separator } from '@/components/ui/separator'

function SectionTitle({ text }: { text: string }) {
  return (
    <div>
      <h2 className="text-3xl font-medium tracking-wider capitalize mb-8">
        {text}
      </h2>
      <Separator />
    </div>
  )
}
export default SectionTitle

// n most projects, SectionTitle is just a small reusable component used to display titles or headings for different sections of a page.
