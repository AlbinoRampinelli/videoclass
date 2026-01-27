// src/app/admin/_components/SearchInput.tsx
'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce" // npm i use-debounce

export default function SearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <input
      type="text"
      placeholder="Buscar por nome, e-mail ou CPF..."
      className="w-full md:w-96 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-[#81FE88] outline-none transition-all"
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('query')?.toString()}
    />
  )
}