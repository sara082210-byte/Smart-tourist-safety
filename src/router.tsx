/**
 * Tiny dependency-free hash router (no extra libraries).
 * Usage:  <Link to="/login">Login</Link>   |   const path = usePath()
 */
import { useEffect, useState } from 'react'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'

const getPath = () => window.location.hash.replace(/^#/, '') || '/'

export function usePath(): string {
  const [path, setPath] = useState(getPath)
  useEffect(() => {
    const onChange = () => {
      setPath(getPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export function navigate(to: string) {
  window.location.hash = to
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
  children: ReactNode
}

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
  }
  return (
    <a href={`#${to}`} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
