import React, { useEffect, useState } from 'react'

import Proposal from './proposal'
import { CircularProgress } from '@ethereansos/interfaces-ui'

import { retrieveSurveyByModel } from '../../../logic/organization.js'
import Description from './description'

import style from '../../../all.module.css'

export default ({element}) => {

  var actives = element.subProposals.filter(it => it.terminationBlock === '0')
  var ended = element.subProposals.filter(it => it.terminationBlock !== '0')

  return (<>
    <Description className={style.DescriptionBig} description={element.description} title="Summary"/>
    <div className={style.Proposals}>
      {actives && actives.length > 0 && <>
        <p><b>Active:</b></p>
        {actives.map(it => <Proposal key={it.id} element={it}/>)}
      </>}
      {ended && ended.length > 0 && <>
        <p><b>Ended:</b></p>
        {ended.map(it => <Proposal key={it.id} element={it}/>)}
      </>}
    </div>
  </>)
}