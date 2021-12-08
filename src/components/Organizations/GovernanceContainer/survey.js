import React from 'react'

import Proposal from './proposal'
import Description from './description'

import style from '../../../all.module.css'

export default ({element, refreshElements, forDelegationVote}) => {

  var actives = element.subProposals && element.subProposals.filter(it => it.terminationBlock === '0').reverse()
  var ended = element.subProposals && element.subProposals.filter(it => it.terminationBlock !== '0').reverse()

  return (<>
    {element.organization.type !== 'delegation' && <Description className={style.DescriptionBig} description={element.description} title="Summary"/>}
    <div className={style.Proposals}>
      {actives && actives.length > 0 && <>
        <p><b>Active:</b></p>
        {actives.map(it => <Proposal refreshElements={refreshElements} key={it.id} element={it} forDelegationVote={forDelegationVote}/>)}
      </>}
      {!forDelegationVote && ended && ended.length > 0 && <>
        {!element.unique && <p><b>Ended:</b></p>}
        {ended.map(it => <Proposal key={it.id} element={it}/>)}
      </>}
    </div>
  </>)
}