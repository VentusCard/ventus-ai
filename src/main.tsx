import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

// Static-bundle audit shim (dev only): allow ?hero=0..1 to jump the scroll-driven
// hero to a given progress by driving the window scroll to the mapped offset.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const heroParam = new URLSearchParams(window.location.search).get('hero')
  if (heroParam !== null) {
    const heroProgress = Number.parseFloat(heroParam)
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
    const findHeroContainer = () => document.querySelector('[data-hero-scroll]')
    const scrollToHeroStage = () => {
      const container = findHeroContainer()
      if (container && document.body.scrollHeight > window.innerHeight * 2) {
        const containerTop = container.getBoundingClientRect().top + window.scrollY
        const scrollable = Math.max(0, (container as HTMLElement).offsetHeight - window.innerHeight)
        window.scrollTo(0, Math.round(containerTop + clamp(heroProgress, 0, 1) * scrollable))
        return true
      }
      return false
    }
    let attempts = 0
    const tick = () => {
      attempts += 1
      if (!scrollToHeroStage() && attempts < 100) {
        window.setTimeout(tick, 150)
      }
    }
    window.setTimeout(tick, 300)
  }
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
