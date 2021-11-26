import React, { useState } from 'react'
import style from './governance-container.module.css'
import Proposal from './proposal.js'

/*
        <p><b>Active:</b></p>
        <Proposal element={element} proposal={proposal} metadata={metadata}/>
        <p><b>Ended:</b></p>
        <Proposal/>
*/

export default ({element, proposal, metadata}) => {
  return (<>
    <p className={style.DescriptionBig} ref={ref => ref && (ref.innerHTML = metadata.description)}/>
    <div className={style.Proposals}>

    </div>
  </>)
}