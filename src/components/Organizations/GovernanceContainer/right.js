import React, { useState } from 'react'
import style from './governance-container.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import Proposal from './proposal.js'
import VoteSelections from '../../Organizations/VoteSelections/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'

const MultiVoteBox = ({element, proposal, metadata}) => {

  const [value, setValue] = useState(proposal.currentValue)
  const [printedValue, setPrintedValue] = useState(null)

  function onSelect(val, printedVal) {
    setValue(val)
    setPrintedValue(printedVal)
  }

  var proposalId;

  try {
    proposalId = proposal.presetProposals[proposal.presetValues.indexOf(value)]
  } catch(e) {}

  return (
    <div className={style.MultiVoteBox}>
      <div className={style.VoteList}>
        {proposal.presetValues.map(it => <VoteSelections
          key={it}
          {...{
            proposalId,
            checked: value === it,
            onSelect,
            discriminator : 'surveyless_' + proposal.index,
            element,
            proposal,
            proposalId,
            metadata,
            value : it,
            decimals : 18,
            isPercentage : true
          }}/>)}
        {value && <RegularVoteBox {...{element, proposal, metadata, proposalId, printedValue}}/>}
      </div>
    </div>
  )
}

export default ({element, proposal, metadata}) => {

  var proposalType = proposal.isPreset ? 'surveyless' : proposal.proposalType

  return (
      <div className={style.Govright}>
        {proposalType === 'surveyless' || proposalType === 'poll' ?  <>
          <h6>Summary</h6>
          <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          <h6>Rationale and motivations</h6>
          <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          <h6>Specification</h6>
          <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
          <h6>Risks</h6>
          <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
        </> : <>
          <p className={style.DescriptionBig}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology... <a>More</a></p>
        </>}
        {proposalType !== 'surveyless' && proposalType !== 'poll' ?
          <div className={style.Proposals}>
            <p><b>Active:</b></p>
            <Proposal element={element} proposal={proposal} metadata={metadata}/>
            <p><b>Ended:</b></p>
            <Proposal/>
          </div> :
          <MultiVoteBox {...{element, proposal, metadata}}/>
        }
    </div>
  )
}
