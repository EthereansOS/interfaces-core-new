import React from 'react'

import style from '../../../../all.module.css'

import DelegationsCreate from './delegation'

const Create = (props) => {
  return <>
    <DelegationsCreate {...props}/>
</>
}

Create.menuVoice = {
  label : 'Create',
  path : '/guilds/create/:id',
}

export default Create