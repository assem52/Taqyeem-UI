import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import taqyemLogo from './assets/taqyem-logo.png'
import './index.css'
import App from './app/App'

function applyFavicon(href) {
  const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]']
  for (const selector of selectors) {
    let link = document.querySelector(selector)
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', selector.includes('shortcut') ? 'shortcut icon' : 'icon')
      document.head.appendChild(link)
    }
    link.type = 'image/png'
    link.href = href
  }

  let apple = document.querySelector('link[rel="apple-touch-icon"]')
  if (!apple) {
    apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    document.head.appendChild(apple)
  }
  apple.href = href
}

applyFavicon(taqyemLogo)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
