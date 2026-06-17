import { useState, useMemo } from 'react'
import { Contact, ContactsState } from '../lib/types'
import { contactService } from '../lib/services/contact.service'

export function useContacts(): ContactsState & {
  setQuery: (q: string) => void
  select: (c: Contact | null) => void
} {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)

  const contacts = useMemo(() => contactService.search(query), [query])

  return {
    contacts,
    selected,
    query,
    loading: false,
    setQuery,
    select: setSelected,
  }
}
