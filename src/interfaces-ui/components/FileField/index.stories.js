import React from 'react'
import { Formik } from 'formik'

import FileField from '.'

const item = {
  title: 'components/FileField',
  component: FileField,
}

export const Default = () => (
  <Formik>
    <FileField
      label="DFO Logo:"
      value="test"
      description="IPFS link to the logo of the organization (must be a .png 320 x 320 pixels)"
    />
  </Formik>
)

export default item
