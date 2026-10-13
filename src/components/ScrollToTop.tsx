import { useEffect } from 'react'
import { useLocation } from 'react-router'

// Scrolls to the top on every route change (e.g. when moving to the next lesson).
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default ScrollToTop
