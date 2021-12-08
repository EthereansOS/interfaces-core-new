import React, { useState } from 'react'

import BackButton from '../../Global/BackButton'

import style from '../../../all.module.css'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'

export default (props) => {

    const stateProvider = useState({})

    const [onClick, setOnClick] = useState(props.onClick)

    const [rationale, setRationale] = useState("")
    const [summary, setSummary] = useState("")
    const [motivations, setMotivations] = useState("")
    const [specification, setSpecification] = useState("")
    const [risks, setRisks] = useState("")

    if(!onClick) {
      const Component = props.Component
      return <Component {...{
        ...props,
        setOnClick,
        stateProvider
      }}/>
    }
    return (
      <div className={style.CreationPageLabelS}>
        <h4>{props.Component ? "Step 2-2: " : ""}Proposal Info</h4>
        <label className={style.CreationPageLabelFS}>
          <h6>Summary</h6>
          <textarea value={summary} onChange={e => setSummary(e.currentTarget.value)}/>
          <p>A brief summary of the proposal.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Motivation</h6>
          <textarea value={motivations} onChange={e => setMotivations(e.currentTarget.value)}/>
          <p>The reason for the proposal. What problems or opportunities are being addressed?</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Rationale</h6>
          <textarea value={rationale} onChange={e => setRationale(e.currentTarget.value)}/>
          <p>Any pragmatic and mathematical considerations of the proposal.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Specifications</h6>
          <textarea value={specification} onChange={e => setSpecification(e.currentTarget.value)}/>
          <p>Any technical changes and links to code for the Proposal.</p>
        </label>
        <label className={style.CreationPageLabelFS}>
          <h6>Risks</h6>
          <textarea value={risks} onChange={e => setRisks(e.currentTarget.value)}/>
          <p>Any possible risks associated with implementing the proposal.</p>
        </label>
        <div className={style.ActionDeploy}>
          {props.Component && <BackButton onClick={() => setOnClick()}/>}
          <ActionAWeb3Button onSuccess={props.onSuccess} onClick={() => onClick({rationale, summary, motivations, risks, specification})}>Propose</ActionAWeb3Button>
        </div>
      </div>
    )
}