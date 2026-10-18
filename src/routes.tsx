/**
 * Central route registry.
 * To add a page: import it and add ONE line to `routes`.
 * Teammates: add your SOS / Journey / Contacts / Assistant entries in the marked section
 * to keep merge conflicts to a single, easy-to-resolve block.
 */
import type { ComponentType } from 'react'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Journey from '../pages/Journey'
import SOS from '../pages/SOS'
import About from '../pages/About'
import HowItWorks from '../pages/HowItWorks'

export const routes: Record<string, ComponentType> = {
  // --- Home / Login / Dashboard (owner: me) ---
  '/': Home,
  '/login': Login,
  '/register': Register,
  '/dashboard': Dashboard,
  '/about': About,
  '/how-it-works': HowItWorks,

  // --- SOS / Journey / Contacts / Assistant (owner: friend) ---
  '/journey': Journey,
  '/journey-checkin': Journey,
  '/sos': SOS,
  '/emergency-sos': SOS,
}


