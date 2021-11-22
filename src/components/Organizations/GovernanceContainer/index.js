import React,{useState} from 'react'

import Left from './left'
import Head from './head'
import Right from './right'
import NewProposal from './new-proposal'

import style from './governance-container.module.css'


export default ({element, headProperties, leftProperties, rightProperties}) => {
  const [proposal, setBanner] = useState(false)
  return (
    <div className={style.GovCard}>
        <Head {...headProperties} element={element}/>
          <div className={style.GovCardOpened}>
            <Left {...leftProperties} element={element}/>
            <Right {...rightProperties} element={element}/>
          </div>
          {!proposal && <NewProposal close={() => setBanner(true)}/>}
    </div>
  )
}
