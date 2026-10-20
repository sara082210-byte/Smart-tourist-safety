import { apiRequest, getJson, postJson } from './apiClient'

export interface UserJourney {
  id?: number
  destinationId: number
  destinationName: string
  startDate?: string
  expectedArrival?: string
  checkInInterval?: string
  remindersEnabled?: boolean
  notifyContacts?: boolean
  lastCheckIn?: string
  nextCheckIn?: string
  status?: string
  updatedAt?: string
}

export interface JourneyInput {
  destinationId: number
  destinationName: string
  startDate?: string
  expectedArrival?: string
  checkInInterval?: string
  remindersEnabled?: boolean
  notifyContacts?: boolean
  lastCheckIn?: string
  nextCheckIn?: string
  status?: string
}

export async function getActiveJourney(): Promise<UserJourney | null> {
  const res = await apiRequest('/api/journey/active')
  if (res.status === 204 || res.status === 404) return null
  if (!res.ok) return null
  return (await res.json()) as UserJourney
}

export async function saveActiveJourney(journey: JourneyInput): Promise<UserJourney> {
  return await postJson<UserJourney>('/api/journey/active', journey)
}

export async function checkInJourney(lastCheckIn = 'Just now', nextCheckIn = 'In 2 hours'): Promise<UserJourney> {
  return await postJson<UserJourney>('/api/journey/checkin', { lastCheckIn, nextCheckIn })
}
