import React, { useEffect, useState } from 'react'

import { VOID_BYTES32, useWeb3 } from '@ethereansos/interfaces-core'

import { useGlobalModal } from '../../../logic/uiUtilities'

import OurCircularProgress from '../OurCircularProgress'
import RegularModal from '../RegularModal'

import style from '../../../all.module.css'

const Element = props => {

    const { stateData, index, element } = props

    const { web3 } = useWeb3()

    const [state, setState] = stateData

    const { selected, sequenceStatus } = state

    const isSelected = selected === index || ((selected === undefined || selected === null) && index === 0)

    const status = sequenceStatus[index].status

    const [transactionHash, setTransactionHash] = useState()
    const [transactionHashElaborated, setTransactionHashElaborated] = useState(false)

    useEffect(() => setTimeout(async () => {
        setTransactionHashElaborated(false)
        setState(oldValue => ({...oldValue, errorMessage : undefined}))
        if(!element.onTransactionReceipt || !transactionHash || transactionHash.toLowerCase().indexOf("0x") !== 0 || transactionHash.length !== VOID_BYTES32.length) {
            return
        }
        setTransactionHashElaborated()
        try {
            const resultState = await element.onTransactionReceipt(await web3.eth.getTransactionReceipt(transactionHash), state, element)
            setTransactionHashElaborated(resultState || {})
        } catch(e) {
            setTransactionHashElaborated(false)
            setState(oldValue => ({...oldValue, errorMessage : e.message || e}))
        }
    }), [transactionHash])

    function confirmTransaction() {
        nextStep(transactionHashElaborated)
    }

    function nextStep(resultState) {
        setState(oldValue => ({...oldValue, selected : index + 1, sequenceStatus : sequenceStatus.map((it, i) => ({...it, status : index === i ? "done" : it.status})), ...resultState}))
        setTransactionHashElaborated(false)
    }

    async function performAction() {
        if(transactionHash !== undefined && transactionHash !== null) {
            return
        }
        setState(oldValue => ({...oldValue, errorMessage : undefined, sequenceStatus : sequenceStatus.map((it, i) => ({...it, status : index === i ? "pending" : it.status}))}))
        try {
            nextStep(await element.onAction(state, element))
        } catch(e) {
            setState(oldValue => ({...oldValue, errorMessage : e.message || e, sequenceStatus : sequenceStatus.map((it, i) => ({...it, status : index === i ? "error" : it.status}))}))
        }
    }

    return (<>
            <div className={style.FinalizeSequenceBoxIn}>
                {isSelected && <img className={style.Hand} src={`${process.env.PUBLIC_URL}/img/DiamondHand.png`}></img>}
                <p>
                    {status === "pending" && <span className={style.SequenceStatus}><OurCircularProgress/></span>}
                    {status === "done" && <span className={style.SequenceStatus}>✅ </span>}
                    {status === "skipped" && <span className={style.SequenceStatus}>⏩ </span>}
                    {status === "error" && <span className={style.SequenceStatus}>❌ </span>}
                    {!isSelected && status === "todo" && <span className={style.SequenceStatus}>🔹 </span>}
                    {isSelected && status === "todo" && <span className={style.SequenceStatus}>🔷 </span>}
                    {element.label}
                </p>
            
                {isSelected && status !== "pending" && status !== "done" && status !== "skipped" && <>
                    <div className={style.FinalizeSequenceBoxButtons}>
                        {element.onTransactionReceipt && <a className={style.RegularButtonDuo} onClick={() => setTransactionHash(transactionHash !== undefined && transactionHash !== null ? undefined : "")}>Recover</a>}
                        {(transactionHash === undefined || transactionHash === null) && <a className={style.ActionAWeb3Button} onClick={performAction}>{element.text || (index === sequenceStatus.length - 1 ? "Finalize" : "Deploy")}</a>}
                    </div>
                </>}
                
                {transactionHash !== undefined && transactionHash !== null && <div className={style.CreationPageLabelF}>
                    <p>If you already did this transaction, you can recover it by pasting the transaction hash</p>
                    <input type="text" disabled={(!transactionHashElaborated && transactionHashElaborated !== false) || status === 'done'} value={transactionHash} onChange={e => setTransactionHash(e.currentTarget.value)} placeholder="Transaction hash"/>
                    {!transactionHashElaborated && transactionHashElaborated !== false && <OurCircularProgress/>}
                    {transactionHashElaborated && <div className={style.FinalizeSequenceBoxButtons}> <a className={style.RegularButtonDuo} onClick={confirmTransaction}>Confirm</a></div>}
                </div>}
            </div>
    </>)
}

const Main = props => {

    const { initialState, sequence, onClose, onComplete } = props

    const stateData = useState({ ...initialState, sequenceStatus : (initialState && initialState.sequenceStatus) || sequence.map(() => ({status : "todo"}))})

    const { sequenceStatus, errorMessage } = stateData[0]

    useEffect(() => {
        if(!onClose && !onComplete) {
            return
        }
        if(sequenceStatus.filter(it => it.status === "pending" || it.status === "todo" || it.status === "error").length > 0) {
            return
        }
        onClose && onClose()
        onComplete && onComplete(stateData[0])
    }, [onClose, onComplete, sequenceStatus, stateData[0]])

    function close() {
        if(sequenceStatus.filter(it => it.status === "pending").length > 0) {
            return
        }
        onClose && onClose()
    }

    return (<>
        {onClose && <a onClick={close}>X</a>}
        <div className={style.FinalizeSequenceBox}>
            {sequence.map((element, index) => <Element key={element.label} {...{...props, stateData, index, element : {...element, index}}}/>)}
            {errorMessage && 
            <div className={style.SequenceStatusErrorBox}>
                <p>{errorMessage}</p>
            </div>}
        </div>
    </>)
}

/*export default props => {

    const globalModal = useGlobalModal()

    const mainProperties = {
        ...props,
        onClose : props.onClose ? () => {
            globalModal.show()
            props.onClose()
        } : undefined
    }

    useEffect(() => void(
        globalModal.show(),
        globalModal.show({
            content : <Main {...mainProperties}/>
        })
    ), [])

    return (<></>)
}*/

export default props => <RegularModal close={props.onClose}><Main {...{...props, onClose : undefined}}/></RegularModal>