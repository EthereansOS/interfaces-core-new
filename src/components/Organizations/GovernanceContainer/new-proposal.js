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
              <h6>Summary</h6>
              <textarea></textarea>
            </label>
            <label>
              <h6>Rationale and motivations</h6>
              <textarea></textarea>
            </label>
            <label>
              <h6>Specification</h6>
              <textarea></textarea>
            </label>
            <label>
              <h6>Risks</h6>
              <textarea></textarea>
            </label>
            <label>
              <h6>Discussion link</h6>
              <input type="link"></input>
            </label>
            {proposalType === 'poll' &&  <>
            <div className={style.ContextualPool}>
              <h6>Context</h6>
              <label>
                <input type="radio"></input>
                <span>Contract</span>
                <input type="text"></input>
              </label>
              <label>
                <input type="radio"></input>
                <span>Organization</span>
                <select></select>
              </label>
              <label>
                <input type="radio"></input>
                <span>Delegation</span>
                <select></select>
              </label>
              <label>
                <input type="radio"></input>
                <span>0x0000000</span>
              </label>
            </div>
            <div className={style.ContextualPool}>
              <h6>Voting powers</h6>
            </div>
            <label>
              <h6>Token:</h6>
              <a className={style.TradeMarketTokenSelector}>
                  <figure>
                      <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
                  </figure>
              </a>
            </label>
            </> }
        </div>

      </div>
    </div>
  )
}
