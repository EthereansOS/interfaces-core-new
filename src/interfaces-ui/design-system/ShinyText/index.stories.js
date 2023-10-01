/* eslint-disable import/no-anonymous-default-export */
import React from 'react'

import ShinyText from '.'

export default {
  title: 'design-system/ShinyText',
  component: ShinyText,
}

export const Collection = () => (
  <>
    <ShinyText text="Default text" />
    <br />
    <ShinyText animated text="Animated text" />
    <br />
    <ShinyText hover text="Hover text" />
    <br />
    <ShinyText hover animated text="Hover animated text" />
  </>
)
