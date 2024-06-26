import React, { useEffect, useState } from 'react'

import { useEthosContext, fromDecimals } from 'interfaces-core'
import CreateOrEditFixedInflationEntryOperation from './CreateOrEditFixedInflationEntryOperation'
import style from '../../../../all.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default (props) => {
  const context = useEthosContext()

  const [step, setStep] = useState(0)
  const [operations, setOperations] = useState(props.entry.operations || [])
  const [entryName, setEntryName] = useState(props.entry.name || '')
  const [lastBlock, setLastBlock] = useState(props.entry.lastBlock || 0)
  const [blockInterval, setBlockInterval] = useState(
    props.entry.blockInterval || Object.values(context.blockIntervals)[0]
  )
  const [callerRewardPercentage, setCallerRewardPercentage] = useState(
    props.entry.callerRewardPercentage || 0
  )
  const [hasCallerRewardPercentage, setHasCallerRewardPercentage] = useState(
    (props.entry.callerRewardPercentage || 0) > 0
  )
  const [hasLastBlock, setHasLastBlock] = useState(
    (props.entry.lastBlock || 0) > 0
  )
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
    if (
      operations[editingOperation].add &&
      editingOperation === operations.length - 1
    ) {
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
    setOperations(operations.map((it) => it))
  }

  function onCallerPercentageChange(e) {
    var value = 0
    try {
      value = parseFloat(e.target.value.split('-').join('').trim())
    } catch (e) {}
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
    [
      function () {
        return (
          <>
            <ScrollToTopOnMount />

            <div className={style.FancyExplanationCreate}>
              <h2>Basic Info</h2>
            </div>
            <label className={style.CreationPageLabelF}>
              <h6>Routine Title*</h6>
              <p>Choose an unique title for your routine</p>
              <input
                placeholder="Title"
                onChange={(e) => setEntryName(e.currentTarget.value)}
                value={entryName}
              />
            </label>
            <label className={style.CreationPageLabelF}>
              <h6>Execution Time Interval*</h6>
              <p>
                The minimum amount of time that must pass between each execution
              </p>
              <select
                className={style.CreationSelectW}
                onChange={(e) => setBlockInterval(e.currentTarget.value)}
                value={blockInterval}>
                {Object.entries(context.blockIntervals).map((it) => (
                  <option key={it[0]} value={it[1]}>
                    {it[0]}
                  </option>
                ))}
              </select>
            </label>
          </>
        )
      },
      function () {
        return entryName === '' || blockInterval === 0
      },
    ],
    [
      function () {
        return (
          <>
            <ScrollToTopOnMount />

            <div className={style.FancyExplanationCreate}>
              <h2>Execution Block</h2>
            </div>
            <div className={style.CreationPageLabelF}>
              <h6>Start Block</h6>
              <input
                type="checkbox"
                checked={hasLastBlock}
                onChange={onHasLastBlockChange}
              />
              <p>
                If selected, the first operation of the inflation contract will
                become executable immediately after the chosen block ends. If
                not, the operation will become executable immediately after the
                contract’s deployment block ends.
              </p>
              {hasLastBlock && (
                <input
                  type="number"
                  placeholder="Start Block"
                  label="Start Block:"
                  min="0"
                  onChange={(e) => setLastBlock(parseInt(e.target.value))}
                  value={lastBlock}
                />
              )}
            </div>
          </>
        )
      },
      function () {
        return !(!hasLastBlock || lastBlock > 0)
      },
    ],
    [
      function () {
        return (
          <>
            <ScrollToTopOnMount />

            <div className={style.FancyExplanationCreate}>
              <h2>Manage Operations</h2>
            </div>
            <div className={style.CreationPageLabelF}>
              <p>
                When executed, a routine can trigger one or more operations.
                Each operation can involve the transfer of ETH, Items or other
                tokens from a single address to one or more others; or it can
                involve the swap of ETH, an Item or another token on an AMM for
                any other token, as well as the transfer of the acquired token
                to one or more addresses.
              </p>
            </div>
            {editingOperation === null &&
              operations.map((entryOperation, entryOperationIndex) => (
                <div
                  className={style.CreationPageLabelF}
                  key={entryOperationIndex}>
                  <span>
                    {entryOperation.actionType}{' '}
                    {entryOperation.amount && entryOperation.amount !== '0'
                      ? fromDecimals(
                          entryOperation.amount,
                          entryOperation.inputToken.decimals
                        )
                      : `${entryOperation.percentage}% (supply)`}{' '}
                    {entryOperation.inputToken.symbol} to{' '}
                    {entryOperation.receivers.length} receiver(s)
                  </span>
                  <a
                    className={style.RoundedButton}
                    onClick={() => removeEntryOperation(entryOperationIndex)}>
                    X
                  </a>
                  <a
                    className={style.RoundedButton}
                    onClick={() =>
                      editOrAddEntryOperation(entryOperationIndex)
                    }>
                    ⚙️
                  </a>
                </div>
              ))}
            <div>
              <a
                className={style.RoundedButton}
                onClick={editOrAddEntryOperation}>
                +
              </a>
            </div>
          </>
        )
      },
      function () {
        return operations.length === 0
      },
    ],
    [
      function () {
        return (
          <>
            <ScrollToTopOnMount />

            <div className={style.FancyExplanationCreate}>
              <h2>Executor Reward</h2>
            </div>
            <div className={style.CreationPageLabelF}>
              <p>
                Bots on Ethereum search around the clock to find and execute
                operations that reap them more rewards than what they will pay
                in gas. As a result, setting a fair and profitable executor
                reward can help ensure the automation of your routine as it
                won’t rely on manual execution by humans.
              </p>
            </div>
            <div className={style.CreationPageLabelF}>
              <h6>Executor Reward</h6>
              <input
                type="checkbox"
                checked={hasCallerRewardPercentage}
                onChange={onHasCallerRewardPercentageChange}
              />
              {hasCallerRewardPercentage && (
                <div>
                  <aside>{callerRewardPercentage} %</aside>
                  <input
                    type="range"
                    placeholder="Executor Reward Perchentage (%)"
                    label="Caller reward %:"
                    min="0"
                    max="100"
                    onChange={onCallerPercentageChange}
                    value={callerRewardPercentage}
                  />
                </div>
              )}
            </div>
          </>
        )
      },
      function () {
        return !(
          !hasCallerRewardPercentage ||
          (callerRewardPercentage > 0 && callerRewardPercentage < 100)
        )
      },
    ],
  ]

  return editingOperation != null ? (
    <CreateOrEditFixedInflationEntryOperation
      operation={operations[editingOperation]}
      cancelEditOperation={cancelEditOperation}
      saveEditOperation={saveEditOperation}
    />
  ) : (
    <>    
    <div className={style.CreatePage}>
      <ScrollToTopOnMount />

      <div>
        <div className={style.WizardHeader}>
          <h3>
            Routine Creation <Tooltip placement="bottom" title="Select the tokens, addresses, and swaps the routine will execute" arrow><InfoOutlinedIcon sx={{ fontSize: 20 }}/></Tooltip>
          </h3>
          <div className={style.WizardHeaderDescription}>
            
          </div>

          <div className={style.WizardProgress}>
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className={style.WizardProgressStep + ' ' + (index < step ? style.WizardProgressStepCompleted : style.WizardProgressStepToComplete)}
                    style={{
                      width: `calc(100% / ${5} - 40px)`, // Adjust the subtraction value based on the desired spacing between steps
                      marginRight: '20px', // Half of the subtracted value for even spacing; adjust as needed
                      display: 'inline-block',
                      height: '15px', // Example height, adjust as needed
                      borderRadius: '10px',
                    }}
                  ></div>
                ))}
                <span style={{position:'relative', top:'-3px'}}>step {step + 1} of 5</span>
              </div>
        </div>
        
      </div>
      <div className={style.mtop30}>
          <div className={style.CreationPageLabel}>
            {steps[step][0]()}
            
          </div>
          <div className={style.WizardFooter}>
              {step !== 0 && (
                <button
                  className={style.WizardFooterBack}
                  onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              {step !== steps.length - 1 && (
                <button
                  className={style.WizardFooterNext}
                  disabled={steps[step][1]()}
                  onClick={() => !steps[step][1]() && setStep(step + 1)}>
                  Next
                </button>
              )}
              {step === steps.length - 1 && (
                <button
                  className={style.WizardFooterNext}
                  disabled={steps[step][1]()}
                  onClick={() =>
                    !steps[step][1]() &&
                    props.saveEntry(
                      entryName,
                      lastBlock,
                      blockInterval,
                      callerRewardPercentage,
                      operations
                    )
                  }>
                  Next
                </button>
              )}
            </div>

        </div>
    </div>
    </>
    
  )
}
