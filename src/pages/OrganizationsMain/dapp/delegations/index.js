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
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default DelegationsList