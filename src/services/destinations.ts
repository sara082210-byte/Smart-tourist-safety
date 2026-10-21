import { getJson } from './apiClient'

export interface Destination {
  id: number
  name: string
  state: string
  description: string
  latitude: number
  longitude: number
  imageUrl: string
}

/**
 * Fetch all destinations from the Spring Boot backend
 * Endpoint: GET /api/v1/destinations
 */
export async function fetchDestinations(): Promise<Destination[]> {
  return getJson<Destination[]>('/api/v1/destinations')
}

/**
 * Fetch a single destination by ID from the Spring Boot backend
 * Endpoint: GET /api/v1/destinations/{id}
 */
export async function fetchDestinationById(id: number | string): Promise<Destination> {
  return getJson<Destination>(`/api/v1/destinations/${id}`)
}

export const getDestinations = fetchDestinations
export const getDestinationById = fetchDestinationById

export default {
  fetchDestinations,
  fetchDestinationById,
  getDestinations,
  getDestinationById,
}
