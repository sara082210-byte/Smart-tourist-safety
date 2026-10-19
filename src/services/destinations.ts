export interface Destination {
  id: number
  name: string
  state: string
  description: string
  latitude: number
  longitude: number
  imageUrl: string
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

/**
 * Fetch all destinations from the Spring Boot backend
 * Endpoint: GET http://localhost:8080/api/v1/destinations
 */
export async function fetchDestinations(): Promise<Destination[]> {
  const response = await fetch(`${API_BASE_URL}/destinations`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch destinations (${response.status} ${response.statusText})`
    )
  }

  return response.json()
}

/**
 * Fetch a single destination by ID from the Spring Boot backend
 * Endpoint: GET http://localhost:8080/api/v1/destinations/{id}
 */
export async function fetchDestinationById(id: number | string): Promise<Destination> {
  const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch destination #${id} (${response.status} ${response.statusText})`
    )
  }

  return response.json()
}

export const getDestinations = fetchDestinations
export const getDestinationById = fetchDestinationById

export default {
  fetchDestinations,
  fetchDestinationById,
  getDestinations,
  getDestinationById,
}
