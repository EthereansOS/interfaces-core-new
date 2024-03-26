import React, { useEffect } from 'react'

const ScrollToTopOnMount = () => {
  useEffect(() => {
    const lightDiv = document.querySelector('[class*=light]')
    if (lightDiv) {
      lightDiv.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
    const darkDiv = document.querySelector('[class*=dark]')
    if (darkDiv) {
      darkDiv.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [])

  return null
}

export default ScrollToTopOnMount
