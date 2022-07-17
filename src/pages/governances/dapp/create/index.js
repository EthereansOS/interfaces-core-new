import React from 'react'

import style from '../../../../all.module.css'

import DelegationsCreate from './delegation'

const Create = (props) => {
  return <>
  <div className={style.OnlyDesktop}>
    <DelegationsCreate {...props}/>
  </div>
  <div className={style.OnlyMobile}>
    <div className={style.CreateBoxDesc}>
        <p>This function is not available for mobile devices.</p>
    </div>
  </div>
</>
}

Create.menuVoice = {
  label : 'Create',
  path : '/guilds/dapp/create/:id',
}

export default Create