import React from 'react'
import { Formik } from 'formik'

import EditField from '.'

const item = {
  title: 'components/EditField',
  component: EditField,
}

export const Default = () => (
  <Formik>
    <EditField label="DFO Logo:" value="test" description="Set a description" />
  </Formik>
)

export default item
