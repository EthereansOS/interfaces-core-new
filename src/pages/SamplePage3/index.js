import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './sample3.module.css'

const SamplePage3 = () => {
  return (
    <>
      <Typography className={style.title} variant="h3" color="black">
        Sample page 3
      </Typography>
      <Typography className={style.text} variant="body2" color="black">
        This is a sample page
      </Typography>
    </>
  )
}

SamplePage3.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/sample3',
        Component: SamplePage3,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'sample-page-3',
        label: 'Sample Page 3',
        link: '/sample3',
        index,
      })
    }

export default SamplePage3
