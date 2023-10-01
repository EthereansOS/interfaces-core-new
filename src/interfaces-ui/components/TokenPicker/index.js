import React, { useMemo } from 'react'
import T from 'prop-types'
import { useLoadUniswapPairs } from 'interfaces-core'
import { useField, useFormikContext } from 'formik'

import { Select } from '../../design-system'

import style from './token-picker.module.scss'

const TokenPicker = ({ tokenAddress, id, name }) => {
  const [{ onChange, ...field }] = useField({ id, name })
  const { setFieldValue } = useFormikContext()

  const uniswapPairs = useLoadUniswapPairs(tokenAddress)

  const options = useMemo(
    () =>
      uniswapPairs.map((pair) => ({
        id: pair?.token1?.address || pair.address,
        label: pair?.token1?.name
          ? `${pair.token1.name} (${pair.token1.symbol})`
          : pair.symbol,
      })),
    [uniswapPairs]
  )

  return (
    <Select
      id="token"
      name="token"
      options={options}
      valueKey="token"
      containerClassName={style.root}
      {...field}
      onSelect={(id, value) => {
        setFieldValue(id, value)
      }}
    />
  )
}

TokenPicker.propTypes = {
  tokenAddress: T.string,
  id: T.string,
  name: T.string,
}

export default TokenPicker
