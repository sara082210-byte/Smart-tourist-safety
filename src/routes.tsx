/**
 * Central route registry.
 * To add a page: import it and add ONE line to `routes`.
 * Teammates: add your SOS / Journey / Contacts / Assistant entries in the marked section
 * to keep merge conflicts to a single, easy-to-resolve block.
 */
import type { ComponentType } from 'react'
import Home from '../pages/Home'
import Login from '../pages/Login'

export const routes: Record<string, ComponentType> = {
  // --- Home / Login / Dashboard (owner: me) ---
  '/': Home,
  '/login': Login,

  // --- SOS / Journey / Contacts / Assistant (owner: friend) ---
}
