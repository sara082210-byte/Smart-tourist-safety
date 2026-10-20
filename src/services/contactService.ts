import { getJson, postJson, putJson, deleteJson } from './apiClient'

export interface EmergencyContact {
  id: number
  name: string
  relationship: string
  phone: string
  isPrimary: boolean
}

export interface ContactInput {
  name: string
  relationship: string
  phone: string
  isPrimary?: boolean
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return await getJson<EmergencyContact[]>('/api/contacts')
}

export async function createEmergencyContact(contact: ContactInput): Promise<EmergencyContact> {
  return await postJson<EmergencyContact>('/api/contacts', contact)
}

export async function updateEmergencyContact(id: number, contact: ContactInput): Promise<EmergencyContact> {
  return await putJson<EmergencyContact>(`/api/contacts/${id}`, contact)
}

export async function deleteEmergencyContact(id: number): Promise<void> {
  await deleteJson(`/api/contacts/${id}`)
}
