import React from 'react'
import style from './governance-container.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import Proposal from './proposal.js'
import VoteSelections from '../../Organizations/VoteSelections/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'


export default ({element, proposalType}) => {
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
        {proposalType !== 'surveyless' || proposalType !== 'poll' ?  <>
          <div className={style.Proposals}>
            <p><b>Active:</b></p>
            <Proposal/>
            <p><b>Ended:</b></p>
            <Proposal/>
          </div>
        </> : <>
          <div className={style.MultiVoteBox}>
            <div className={style.VoteList}>
              <VoteSelections/>
              <VoteSelections/>
              <VoteSelections/>
              <VoteSelections/>
              <VoteSelections/>
              <RegularVoteBox/>
            </div>
          </div>
        </>}
    </div>
  )
}
