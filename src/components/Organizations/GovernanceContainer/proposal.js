import React from 'react'
import style from './governance-container.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import VoteSelections from '../../Organizations/VoteSelections/index.js'
import RegularVoteBox from '../../Organizations/RegularVoteBox/index.js'


export default ({element, proposalType}) => {
  return (
    <div className={style.Proposal}>
      <div className={style.ProposalTitle}>
      {/*<h6>Proposal Title</h6>*/}
      <h6>New selection: <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a> <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a> <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a> <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a></h6>
      {/* <h6>New selection: <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a> <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a> <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a> <a><img src={`${process.env.PUBLIC_URL}/img/tokentest/cro.png`}></img></a></h6> */}
        <ExtLinkButton/>
        <ExtLinkButton/>
        <div className={style.ProposalResult}>
          <p className={style.PendingTagGreen}>Succeding</p>
        {/*
          <p className={style.PendingTagBlue}>Pending</p>
          <p className={style.PendingTagGreen}>Succed</p>
          <p className={style.PendingTagGreen}>Executed</p>
          <p className={style.PendingTagRed}>Defeated</p> 
          */} 
        </div>
      </div>
      <div className={style.ProposalVotesCount}>
        <span>Votes: 200,000</span>
        <RegularButtonDuo/>
      </div>
      <div className={style.ProposalOpen}>
        <p className={style.DescriptionSmall}>Welcome to the Buidlerberg Event 2020! Tucked away deep inside the Ethereum network, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology, a community of researchers study and experiment with DFO technology.</p>
      <div className={style.Upshots}>
        <p>upshot</p>
        <Upshots/>
        <Upshots/>
      </div>
      <div className={style.Vote}>
    <p><b>Choose from:</b></p>
    <div className={style.VoteList}>
      <VoteSelections/>
      <VoteSelections/>
      <VoteSelections/>
      <RegularVoteBox/>
    </div>

      </div>

      </div>
    </div>
  )
}
