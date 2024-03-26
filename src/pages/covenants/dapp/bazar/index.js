import React from 'react'
import style from '../../../../all.module.css'
import Trade from '../../../../components/Global/Trade'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const Bazar = () => {
  return (
    <div>
      <ScrollToTopOnMount />

      <Trade />
    </div>
  )
}

Bazar.menuVoice = {
  label: 'Token Swap',
  path: '/covenants',
  index: 0,
}

export default Bazar
