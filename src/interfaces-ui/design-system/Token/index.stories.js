/* eslint-disable import/no-anonymous-default-export */
import React from 'react'

import Token from '.'

export default {
  title: 'design-system/Token',
  component: Token,
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#000000' }],
    },
  },
}

const Template = (args) => <Token {...args} />

export const IconOnly = Template.bind({})

IconOnly.args = {
  address: '0x0000000000000000000000000000000000000000',
  showIcon: true,
}

export const SymbolOnly = Template.bind({})

SymbolOnly.args = {
  address: '0x0000000000000000000000000000000000000000',
  showSymbol: true,
}

export const Ethereum = Template.bind({})

Ethereum.args = {
  address: '0x0000000000000000000000000000000000000000',
  showIcon: true,
  showSymbol: true,
}

export const Generic = Template.bind({})

Generic.args = {
  address: 'generic',
  showIcon: true,
  showSymbol: true,
}
