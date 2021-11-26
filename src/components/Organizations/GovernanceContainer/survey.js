import React, { useEffect, useState } from 'react'

import Proposal from './proposal'
import { CircularProgress } from '@ethereansos/interfaces-ui'

import { retrieveSurveyByModel } from '../../../logic/organization.js'

import style from './governance-container.module.css'

export default ({proposal, metadata}) => {

  const [values, setValues] = useState(null)

  async function checkAll() {
    setValues(await retrieveSurveyByModel({}, proposal))
  }

  useEffect(() => {
    checkAll()
  }, [])

  var actives = values && values.filter(it => it.terminationBlock === '0')
  var ended = values && values.filter(it => it.terminationBlock !== '0')

  return (<>
    <p className={style.DescriptionBig} ref={ref => ref && (ref.innerHTML = metadata.description)}/>
    <div className={style.Proposals}>
      {!values && <CircularProgress/>}
      {actives && actives.length > 0 && <>
        <p><b>Active:</b></p>
        {actives.map(it => <Proposal key={it.id} element={it} checkAll={checkAll} proposal={proposal} metadata={metadata}/>)}
      </>}
      {ended && ended.length > 0 && <>
        <p><b>Ended:</b></p>
        {ended.map(it => <Proposal key={it.id} element={it} proposal={proposal} metadata={metadata}/>)}
      </>}
    </div>
  </>)
}