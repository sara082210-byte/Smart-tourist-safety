import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  DestinationData,
  DESTINATIONS_DATA,
  SUPPORTED_DESTINATIONS,
  getDestinationData,
} from '../services/destinationData'
import {
  UserJourney,
  JourneyInput,
  getActiveJourney,
  saveActiveJourney,
  checkInJourney,
} from '../services/journeyService'

interface DestinationContextType {
  selectedDestination: DestinationData
  destinations: DestinationData[]
  activeJourney: UserJourney | null
  loading: boolean
  setDestination: (destination: DestinationData | number) => Promise<void>
  updateJourney: (journey: Partial<JourneyInput>) => Promise<void>
  doCheckIn: () => Promise<void>
  refreshJourney: () => Promise<void>
}

const STORAGE_KEY = 'safejourney_selected_dest_id'

const DestinationContext = createContext<DestinationContextType | undefined>(undefined)

export const DestinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with persisted ID in localStorage or default to Goa (ID 1)
  const [selectedDestination, setSelectedDestinationState] = useState<DestinationData>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY)
      if (savedId) {
        const idNum = parseInt(savedId, 10)
        if (DESTINATIONS_DATA[idNum]) {
          return DESTINATIONS_DATA[idNum]
        }
      }
    } catch {
      // LocalStorage access issue
    }
    return DESTINATIONS_DATA[1] // Goa
  })

  const [activeJourney, setActiveJourney] = useState<UserJourney | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch active journey from backend on initial mount
  const refreshJourney = useCallback(async () => {
    try {
      const journey = await getActiveJourney()
      if (journey) {
        setActiveJourney(journey)
        if (journey.destinationId && DESTINATIONS_DATA[journey.destinationId]) {
          setSelectedDestinationState(DESTINATIONS_DATA[journey.destinationId])
          localStorage.setItem(STORAGE_KEY, String(journey.destinationId))
        }
      }
    } catch {
      // Unauthenticated or network issue - fallback to localStorage
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshJourney()
  }, [refreshJourney])

  // Change destination across app and sync with backend active journey
  const setDestination = async (destination: DestinationData | number) => {
    const dest = typeof destination === 'number' ? getDestinationData(destination) : destination
    setSelectedDestinationState(dest)
    try {
      localStorage.setItem(STORAGE_KEY, String(dest.id))
    } catch {
      // Storage unavailable
    }

    // Attempt to persist active journey to backend
    try {
      const updated = await saveActiveJourney({
        destinationId: dest.id,
        destinationName: dest.name,
        startDate: activeJourney?.startDate || 'Today',
        expectedArrival: activeJourney?.expectedArrival || 'Today',
        checkInInterval: activeJourney?.checkInInterval || 'Every 2 hours',
        remindersEnabled: activeJourney?.remindersEnabled ?? true,
        notifyContacts: activeJourney?.notifyContacts ?? true,
        lastCheckIn: activeJourney?.lastCheckIn || 'Just now',
        nextCheckIn: activeJourney?.nextCheckIn || 'In 2 hours',
        status: activeJourney?.status || 'On Track',
      })
      setActiveJourney(updated)
    } catch {
      // If unauthenticated or offline, we maintain in-memory & localStorage state
      setActiveJourney((prev) => ({
        destinationId: dest.id,
        destinationName: dest.name,
        startDate: prev?.startDate || 'Today',
        expectedArrival: prev?.expectedArrival || 'Today',
        checkInInterval: prev?.checkInInterval || 'Every 2 hours',
        remindersEnabled: prev?.remindersEnabled ?? true,
        notifyContacts: prev?.notifyContacts ?? true,
        lastCheckIn: prev?.lastCheckIn || 'Just now',
        nextCheckIn: prev?.nextCheckIn || 'In 2 hours',
        status: prev?.status || 'On Track',
      }))
    }
  }

  // Update existing journey details
  const updateJourney = async (updates: Partial<JourneyInput>) => {
    const destId = updates.destinationId || selectedDestination.id
    const dest = getDestinationData(destId)
    setSelectedDestinationState(dest)
    try {
      localStorage.setItem(STORAGE_KEY, String(dest.id))
    } catch {
      // Storage unavailable
    }

    try {
      const updated = await saveActiveJourney({
        destinationId: dest.id,
        destinationName: dest.name,
        startDate: updates.startDate ?? activeJourney?.startDate ?? 'Today',
        expectedArrival: updates.expectedArrival ?? activeJourney?.expectedArrival ?? 'Today',
        checkInInterval: updates.checkInInterval ?? activeJourney?.checkInInterval ?? 'Every 2 hours',
        remindersEnabled: updates.remindersEnabled ?? activeJourney?.remindersEnabled ?? true,
        notifyContacts: updates.notifyContacts ?? activeJourney?.notifyContacts ?? true,
        lastCheckIn: updates.lastCheckIn ?? activeJourney?.lastCheckIn ?? 'Just now',
        nextCheckIn: updates.nextCheckIn ?? activeJourney?.nextCheckIn ?? 'In 2 hours',
        status: updates.status ?? activeJourney?.status ?? 'On Track',
      })
      setActiveJourney(updated)
    } catch {
      setActiveJourney((prev) => ({
        destinationId: dest.id,
        destinationName: dest.name,
        startDate: updates.startDate ?? prev?.startDate ?? 'Today',
        expectedArrival: updates.expectedArrival ?? prev?.expectedArrival ?? 'Today',
        checkInInterval: updates.checkInInterval ?? prev?.checkInInterval ?? 'Every 2 hours',
        remindersEnabled: updates.remindersEnabled ?? prev?.remindersEnabled ?? true,
        notifyContacts: updates.notifyContacts ?? prev?.notifyContacts ?? true,
        lastCheckIn: updates.lastCheckIn ?? prev?.lastCheckIn ?? 'Just now',
        nextCheckIn: updates.nextCheckIn ?? prev?.nextCheckIn ?? 'In 2 hours',
        status: updates.status ?? prev?.status ?? 'On Track',
      }))
    }
  }

  // Perform a check in
  const doCheckIn = async () => {
    try {
      const updated = await checkInJourney('Just now', 'In 2 hours')
      setActiveJourney(updated)
    } catch {
      setActiveJourney((prev) =>
        prev
          ? {
              ...prev,
              lastCheckIn: 'Just now',
              nextCheckIn: 'In 2 hours',
              status: 'On Track',
            }
          : null
      )
    }
  }

  return (
    <DestinationContext.Provider
      value={{
        selectedDestination,
        destinations: SUPPORTED_DESTINATIONS,
        activeJourney,
        loading,
        setDestination,
        updateJourney,
        doCheckIn,
        refreshJourney,
      }}
    >
      {children}
    </DestinationContext.Provider>
  )
}

export function useDestination() {
  const context = useContext(DestinationContext)
  if (!context) {
    throw new Error('useDestination must be used within a DestinationProvider')
  }
  return context
}
