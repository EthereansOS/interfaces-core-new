import React from 'react'

import DelegationsCreate from './delegation'

const Create = (props) => {
  return <DelegationsCreate {...props}/>
}

Create.menuVoice = {
  label : 'Create',
  path : '/guilds/dapp/create/:id',
}

export default Create