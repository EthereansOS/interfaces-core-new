import React from 'react'

const SubDAOsList = ({}) => {
  return (
    <div>
      All SubDAOs
    </div>
  )
}

SubDAOsList.menuVoice = {
  label : 'SubDAOs',
  path : '/organizations/dapp/subdaos',
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default SubDAOsList