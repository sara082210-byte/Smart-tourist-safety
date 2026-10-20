import { getJson, postJson } from './apiClient'

export interface IncidentReport {
  id: number
  referenceNumber: string
  incidentType: string
  location: string
  destinationName?: string
  details: string
  latitude?: number
  longitude?: number
  status: string
  createdAt: string
}

export interface IncidentInput {
  incidentType: string
  location: string
  destinationName?: string
  details: string
  latitude?: number
  longitude?: number
}

export async function getIncidents(): Promise<IncidentReport[]> {
  return await getJson<IncidentReport[]>('/api/incidents')
}

export async function createIncident(incident: IncidentInput): Promise<IncidentReport> {
  return await postJson<IncidentReport>('/api/incidents', incident)
}
