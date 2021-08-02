import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './sample2.module.css'

const SamplePage2 = () => {
  return (
    <>
      <Typography className={style.title} variant="h3" color="black">
        Sample page 2
      </Typography>
      <Typography className={style.text} variant="body2" color="black">
        This is a sample page
      </Typography>
    </>
  )
}

SamplePage2.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/sample2',
        Component: SamplePage2,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'sample-page-2',
        label: 'Sample Page 2',
        link: '/sample2',
        index,
      })
    }

export default SamplePage2
