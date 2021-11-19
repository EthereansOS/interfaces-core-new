import React from 'react'
import style from './governance-container.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import VoteSelections from '../../Organizations/VoteSelections/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'


export default ({element, proposalType}) => {
  return (
    <div className={style.ModalBack}>
      <div className={style.ModalBoxGov}>
        <div className={style.ProposeContents}>
          {proposalType === 'poll' ?  <>
            <h5>New Poll</h5>
          </> : <> 
            <h5>New Proposal</h5>
          </>}
          {proposalType !== 'tokens' &&  <>
            <label>
              <h6>Title</h6>
              <input type="text"></input>
            </label>
          </>}
            <label>
              <h6>Description</h6>
              <input type="text"></input>
            </label>
        </div>

      </div>
    </div>
  )
}
