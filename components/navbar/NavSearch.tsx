// push('/about'): goes to /about and adds it to browser history.So you can click "Back" to return.
// replace('/about'): goes to /about but replaces current history.You can't go back to the previous page.

//navsearch uses userparams() for getting url and setting url search box
//useState is used to reflect whatever we have writeen on the input box  //just rernders input box
//
//handleSearch hook uses timelimit for changing the searchParamater in Main URL and rernders  //rerenders entire page as url is reloaded

'use client'
import { Input } from '../ui/input'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { useState, useEffect } from 'react'

function NavSearch() {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const [search, setSearch] = useState(
    searchParams.get('search')?.toString() || ''
  )

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams) //access the url parameters
    if (value) {
      params.set('search', value) //change the url
    } else {
      params.delete('search') //delete the url page
    }
    replace(`/products?${params.toString()}`) //replace with modified url ,,modified url go to the productspage-->productContiner{fetchAll with(search params)]
  }, 300)

  useEffect(() => {
    if (!searchParams.get('search')) {
      setSearch('')
    }
  }, [searchParams.get('search')])

  return (
    <Input
      type="search"
      placeholder="search product..."
      className="max-w-xs dark:bg-muted "
      onChange={(e) => {
        setSearch(e.target.value)
        handleSearch(e.target.value)
      }}
      value={search}
    />
  )
}
export default NavSearch

//first search  is null  when anything is typed inside the search ,it get updated and call the handle_change funciton and it changes the url again page refreshes but the search box contains the text that is derived from url so no change in text
// You type "b"
// → setSearch("b") runs immediately and updates the local state (what you see in the input box).
// → Then handleSearch("b") is scheduled to run after 300ms (because of debounce).

// Before 300ms passes, you quickly type "e" and "d"
// → Each time you type a letter, setSearch() updates the input box instantly.
// → handleSearch() is called again, but the previous debounce timer is cleared, and a new 300ms timer starts.

// Finally, after you stop typing and 300ms pass without changes,
// → handleSearch("bed") runs.
// → It updates the URL with ?search=bed using replace()
// → The page is re-rendered with the filtered products for bed.

//useState
// it makes the input reactive — changes show immediately in the box.
// You type → setSearch("b") → input box shows b
// You type more → setSearch("bed") → input box updates to bed

// useEffect -------It listens for changes in the URL search param.
// If the search param gets removed from the URL (like when you clear the search), it will reset the input box by doing setSearch('').
// You type "bed" → URL becomes ?search=bed
// Then you manually remove ?search=bed from the URL or clear it in another way.
// This effect sees that searchParams.get('search') is now empty and sets input box to empty too.
