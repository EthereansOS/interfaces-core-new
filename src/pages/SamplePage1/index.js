import React from 'react'
import {Typography} from '@ethereansos/interfaces-ui'

import style from './sample1.module.css'

const SamplePage1 = () => {
  return (
    <>
      <Typography className={style.title} variant="h3" color="black">
        Sample page 1
      </Typography>
      <Typography className={style.text} variant="body2" color="black">
        This is a sample page
      </Typography>
    </>
  )
}

SamplePage1.addToPlugin =
  ({index}) =>
    ({addElement}) => {
      addElement('router', {
        index,
        path: '/',
        Component: SamplePage1,
        exact: true,
        requireConnection: false,
        templateProps: {
          menuName: 'appMenu',
          isDapp: false,
        },
      })

      addElement('appMenu', {
        name: 'sample-page-1',
        label: 'Sample Page 1',
        link: '/',
        index,
      })
    }

export default SamplePage1
