import React from 'react'

const DelegationsList = ({}) => {
  return (
    <div>
      All Delegations
    </div>
  )
}

DelegationsList.menuVoice = {
  label : 'Delegations',
  path : '/organizations/dapp',
  subMenuLabel : 'All',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 0
}

export default DelegationsList