import React, { useEffect, useState } from 'react'

import { useEthosContext, fromDecimals } from 'interfaces-core'
import CreateOrEditFixedInflationEntryOperation from './CreateOrEditFixedInflationEntryOperation'
import style from '../../../../all.module.css'

export default props => {

    const context = useEthosContext()

    const [step, setStep] = useState(0)
    const [operations, setOperations] = useState(props.entry.operations || [])
    const [entryName, setEntryName] = useState(props.entry.name || '')
    const [lastBlock, setLastBlock] = useState(props.entry.lastBlock || 0)
    const [blockInterval, setBlockInterval] = useState(props.entry.blockInterval || Object.values(context.blockIntervals)[0])
    const [callerRewardPercentage, setCallerRewardPercentage] = useState(props.entry.callerRewardPercentage || 0)
    const [hasCallerRewardPercentage, setHasCallerRewardPercentage] = useState((props.entry.callerRewardPercentage || 0) > 0)
    const [hasLastBlock, setHasLastBlock] = useState((props.entry.lastBlock || 0) > 0)
    const [editingOperation, setEditingOperation] = useState(null)

    useEffect(() => {
        props.notFirstTime && setStep(steps.length - 1)
    }, [])

    function editOrAddEntryOperation(entryOperationIndex) {
        if (isNaN(entryOperationIndex)) {
            entryOperationIndex = operations.length
            operations.push({ add: true, receivers: [], pathTokens: [] })
            setOperations(operations)
        }
        setEditingOperation(entryOperationIndex)
    }

    function cancelEditOperation() {
        if (operations[editingOperation].add && editingOperation === operations.length - 1) {
            operations.pop()
            setOperations(operations)
        }
        setEditingOperation(null)
    }

    function saveEditOperation(operation) {
        delete operation.add
        operations[editingOperation] = operation
        setOperations(operations)
        setEditingOperation(null)
    }

    function removeEntryOperation(entryOperationIndex) {
        operations.splice(entryOperationIndex, 1)
        setOperations(operations.map(it => it))
    }

    function onCallerPercentageChange(e) {
        var value = 0
        try {
            value = parseFloat(e.target.value.split('-').join('').trim())
        } catch (e) {
        }
        setCallerRewardPercentage(value > 99 ? 99 : value)
    }

    function onHasCallerRewardPercentageChange(e) {
        setHasCallerRewardPercentage(e.currentTarget.checked)
        setCallerRewardPercentage(0)
    }

    function onHasLastBlockChange(e) {
        setHasLastBlock(e.currentTarget.checked)
        setLastBlock(0)
    }

    var steps = [
        [function () {
            return <>
                <div className={style.FancyExplanationCreate}>
                    <h6>Basic Info</h6>
                    <div className={style.proggressCreate}>
                        <div className={style.proggressCreatePerch} style={{width: "25%"}}>Step 1 of 5</div>
                    </div>
                </div>
                <div>
                    <div className={style.CreationPageLabelF}>
                        <h6>Routine Title</h6>
                        <input  placeholder="Title" onChange={e => setEntryName(e.currentTarget.value)} value={entryName} />
                    </div>
                    <div className={style.CreationPageLabelF}>
                        <h6>Blocks Interval</h6>
                        <select className={style.CreationSelectW}  onChange={e => setBlockInterval(e.currentTarget.value)} value={blockInterval}>
                            {Object.entries(context.blockIntervals).map(it => <option key={it[0]} value={it[1]}>{it[0]}</option>)}
                        </select>
                        <p>The minimum amount of time that must pass between each execution</p>
                    </div>
                </div>
            </>
        },
        function () {
            return entryName === '' || blockInterval === 0
        }],
        [function () {
            return <>
                <div className={style.FancyExplanationCreate}>
                    <h6>Start Block</h6>
                    <div className={style.proggressCreate}>
                        <div className={style.proggressCreatePerch} style={{width: "40%"}}>Step 2 of 5</div>
                    </div>
                </div>
                <div className={style.CreationPageLabelF}>
                        <h6>Start Block</h6>
                        <input type="checkbox" checked={hasLastBlock} onChange={onHasLastBlockChange} />
                        <p>If selected, the first operation of the inflation contract will become executable immediately after the chosen block ends. If not, the operation will become executable immediately after the contract’s deployment block ends.</p>
                    {hasLastBlock && <input type="number"  placeholder="Start Block" label="Start Block:" min="0" onChange={e => setLastBlock(parseInt(e.target.value))} value={lastBlock} />}
                </div>
            </>
        },
        function () {
            return !(!hasLastBlock || lastBlock > 0)
        }],
        [function () {
            return <>
                <div className={style.FancyExplanationCreate}>
                    <h6>Manage Operations</h6>
                    <p className={style.BreefRecapB}>When executed, a routine can trigger one or more operations. Each operation can involve the transfer of ETH, Items or other tokens from a single address to one or more others; or it can involve the swap of ETH, an Item or another token on an AMM for any other token, as well as the transfer of the acquired token to one or more addresses.</p>
                    <div className={style.proggressCreate}>
                        <div className={style.proggressCreatePerch} style={{width: "60%"}}>Step 3 of 5</div>
                    </div>
                </div>
                {editingOperation === null && operations.map((entryOperation, entryOperationIndex) => <div className={style.CreationPageLabelF} key={entryOperationIndex} >
                    <span>{entryOperation.actionType} {entryOperation.amount && entryOperation.amount !== '0' ? fromDecimals(entryOperation.amount, entryOperation.inputToken.decimals) : `${entryOperation.percentage}% (supply)`} {entryOperation.inputToken.symbol} to {entryOperation.receivers.length} receiver(s)</span>
                        <a className={style.RoundedButton} onClick={() => removeEntryOperation(entryOperationIndex)}>X</a>
                        <a className={style.RoundedButton} onClick={() => editOrAddEntryOperation(entryOperationIndex)}>⚙️</a>
                </div>)}
                <div>
                    <a className={style.RoundedButton}  onClick={editOrAddEntryOperation}>+</a>
                </div>
            </>
        },
        function () {
            return operations.length === 0
        }],
        [function () {
            return <>
                <div className={style.FancyExplanationCreate}>
                    <h6>Executor Reward</h6>
                    <p className={style.BreefRecapB}>Bots on Ethereum search around the clock to find and execute operations that reap them more rewards than what they will pay in gas. As a result, setting a fair and profitable executor reward can help ensure the automation of your routine as it won’t rely on manual execution by humans.</p>
                    <div className={style.proggressCreate}>
                        <div className={style.proggressCreatePerch} style={{width: "80%"}}>Step 4 of 5</div>
                    </div>
                </div>
                <div className={style.CreationPageLabelF}>
                        <h6>Executor Reward</h6>
                        <input type="checkbox" checked={hasCallerRewardPercentage} onChange={onHasCallerRewardPercentageChange} />
                    {hasCallerRewardPercentage &&
                        <div >
                            <aside>{callerRewardPercentage} %</aside>
                            <input type="range" placeholder="Executor Reward Perchentage (%)" label="Caller reward %:" min="0" max="100" onChange={onCallerPercentageChange} value={callerRewardPercentage} />
                        </div>
                    }
                </div>
            </>
        },
        function () {
            return !(!hasCallerRewardPercentage || (callerRewardPercentage > 0 && callerRewardPercentage < 100))
        }],
    ]

    return editingOperation != null ?
        <CreateOrEditFixedInflationEntryOperation operation={operations[editingOperation]} cancelEditOperation={cancelEditOperation} saveEditOperation={saveEditOperation} />
        : <div className={style.CreatePage}>
            <div >
                {steps[step][0]()}
            </div>
            <div className={style.ActionBTNCreateX}>
                {step !== 0 && <a className={style.Web3BackBTN} onClick={() => setStep(step - 1)} >Back</a>}
                {step !== steps.length - 1 && <a className={style.RegularButton} disabled={steps[step][1]()} onClick={() => !steps[step][1]() && setStep(step + 1)}>Next</a>}
                {step === steps.length - 1 && <a className={style.RegularButton} disabled={steps[step][1]()} onClick={() => !steps[step][1]() && props.saveEntry(entryName, lastBlock, blockInterval, callerRewardPercentage, operations)}>Next</a>}
            </div>
        </div>
}