import { Contact } from '../types'
import { contacts as seedContacts } from '../finance-data'

export interface IContactService {
  getContacts(): Contact[]
  search(query: string): Contact[]
  getById(id: string): Contact | undefined
}

export class ContactService implements IContactService {
  private contacts: Contact[]

  constructor(initial: Contact[] = seedContacts) {
    this.contacts = initial
  }

  getContacts(): Contact[] {
    return this.contacts
  }

  search(query: string): Contact[] {
    if (!query.trim()) return this.contacts
    const q = query.toLowerCase()
    return this.contacts.filter(
      c => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
    )
  }

  getById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id)
  }
}

export const contactService = new ContactService()
