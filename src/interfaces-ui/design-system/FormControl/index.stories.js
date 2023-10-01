/* eslint-disable import/no-anonymous-default-export */
import React from 'react'

import FormControl from '.'

export default {
  title: 'design-system/FormControl',
  component: FormControl,
}

export const SampleFormControl = () => (
  <FormControl control={<input type="checkbox" />} label="Metadata First" />
)
