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
  subMenuLabel : 'All',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 0
}

export default SubDAOsList