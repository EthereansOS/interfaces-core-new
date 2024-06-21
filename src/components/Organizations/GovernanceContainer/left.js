import React, { useEffect, useMemo, useState } from 'react'
import style from '../../../all.module.css'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import Upshots from '../../Organizations/Upshots/index.js'
import VotingPowersList from '../../Organizations/VotingPowersList/index.js'
import GovernanceRules from '../../Organizations/GovernanceRules/index.js'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons'
import TokenBuyOrSell from './tokenBuyOrSell'
import {
  formatMoney,
  isEthereumAddress,
  useWeb3,
  fromDecimals,
  blockchainCall,
  numberToString,
  useEthosContext,
  VOID_BYTES32,
  VOID_ETHEREUM_ADDRESS,
  abi,
  web3Utils,
  getNetworkElement,
} from 'interfaces-core'
import CircularProgress from '../../Global/OurCircularProgress'
import { getData } from '../../../logic/generalReader'
import { proposeTransfer, proposeVote } from '../../../logic/delegation'
import RegularModal from '../../Global/RegularModal'
import TokenInputRegular from '../../Global/TokenInputRegular'
import ProposalMetadata from '../ProposalMetadata'
import BackButton from '../../Global/BackButton'
import GovernanceContainer from './index'
import { getEthereum } from '../../../logic/erc20'
import { getCheckerData, retrieveProposals } from '../../../logic/organization'

const WrapWithdrawModal = ({
  selectedToken,
  tokenSymbol,
  close,
  title,
  onClick,
  other,
  noApproveNeeded,
}) => {
  const [token, setToken] = useState({
    token: selectedToken,
    balance: '0',
    value: '0',
  })

  function onToken(token, balance, value) {
    setToken({ token, balance, value })
  }

  function internalOnClick() {
    return onClick(token)
  }

  return (
    <RegularModal close={close}>
      <h4 style={{marginBottom: '10px'}}>
        {title} {tokenSymbol}
      </h4>
      <TokenInputRegular
        tokens={[token.token]}
        selected={token.token}
        onElement={onToken}
      />
      <ActionAWeb3Buttons
        noApproveNeeded={noApproveNeeded}
        token={token.token}
        balance={token.balance}
        value={token.value}
        buttonText={title}
        other={other}
        onSuccess={close}
        onClick={internalOnClick}
      />
    </RegularModal>
  )
}

const modalOnClick = {
  Withdraw: ({ element, context, web3, chainId, account, block }, token) =>
    blockchainCall(
      token.token.mainInterface.methods.safeTransferFrom,
      account,
      element.organization.components.delegationTokensManager.address,
      token.token.id,
      token.value,
      abi.encode(
        ['address', 'address', 'bytes'],
        [VOID_ETHEREUM_ADDRESS, VOID_ETHEREUM_ADDRESS, '0x']
      )
    ),
  Wrap: ({ element, context, web3, chainId, account, block }, token) => {
    if (
      element.delegationsManager.supportedTokenData[0] !== VOID_ETHEREUM_ADDRESS
    ) {
      return blockchainCall(
        token.token.mainInterface.methods.safeTransferFrom,
        account,
        element.organization.components.delegationTokensManager.address,
        token.token.id,
        token.value,
        abi.encode(
          ['address', 'address', 'bytes'],
          [
            element.delegationsManager.delegationsManagerAddress,
            VOID_ETHEREUM_ADDRESS,
            '0x',
          ]
        )
      )
    }
    return blockchainCall(
      element.organization.components.delegationTokensManager.contract.methods
        .wrap,
      element.delegationsManager.delegationsManagerAddress,
      '0x',
      token.value,
      VOID_ETHEREUM_ADDRESS
    )
  },
}

const ProposeDelegationTransfer = ({ element, setOnClick, stateProvider }) => {
  const context = useEthosContext()

  const useWeb3Data = useWeb3()

  const [state, setState] = stateProvider

  useEffect(() => {
    var percentage
    try {
      percentage = numberToString(
        parseFloat(
          fromDecimals(
            abi.decode(['uint256'], element.presetValues[0])[0].toString(),
            18
          )
        ) * 100
      )
    } catch (e) {}
    setState((state) => ({ ...state, percentage }))
  }, [element])

  useEffect(
    () =>
      !state.token &&
      getEthereum({
        web3: useWeb3Data.web3,
        account: useWeb3Data.account,
      }).then((token) => setState((oldValue) => ({ ...oldValue, token }))),
    []
  )

  function next() {
    !disabled() &&
      setOnClick(
        () => (additionalMetadata) =>
          proposeTransfer(
            { context, ipfsHttpClient: useWeb3Data.ipfsHttpClient },
            element,
            additionalMetadata,
            state.list
          )
      )
  }

  function disabled() {
    if (!state.list || state.list.length === 0) {
      return true
    }

    for (var element of state.list) {
      if (!isEthereumAddress(element.address)) {
        return true
      }
      if (
        !element.value ||
        !element.value === '0' ||
        isNaN(parseFloat(element.value))
      ) {
        return true
      }
    }

    return false
  }

  function add() {
    if (!state.token || !isEthereumAddress(state.address)) {
      return
    }
    if (
      !state.value ||
      !state.value === '0' ||
      isNaN(parseFloat(state.value))
    ) {
      return
    }

    setState((oldValue) => ({
      ...oldValue,
      address: '',
      value: 0,
      list: [
        ...(oldValue.list || []),
        {
          address: oldValue.address,
          token: { ...oldValue.token },
          value: oldValue.value,
        },
      ],
    }))
  }

  const isDisabled = disabled()

  function setAddress(e) {
    var address = e.currentTarget.value
    setState((oldValue) => ({ ...oldValue, address }))
  }

  return (
    <>
      <h4>Transfer - 1/2</h4>
      {element.organization?.type === 'delegation' && (
        <p>
          <br />
          <b>PLEASE NOTE</b>: for security reasons, new Delegations can move a
          maximum of 70% of their assets for each proposal.
        </p>
      )}
      {state.percentage && (
        <p>
          <br />
          <b>PLEASE NOTE</b>: this Organization can move a maximum of{' '}
          {state.percentage}% of their assets for each proposal.
        </p>
      )}
      {state.list?.length > 0 && (
        <div className={style.TranferETHProp}>
          {state.list.map((it, i) => (
            <div
              className={style.TranferETHPropRecap}
              key={`${it.address}_${it.value}_${i}`}>
              <span>
                <b>
                  {formatMoney(
                    fromDecimals(it.value, it.token.decimals, true),
                    5
                  )}{' '}
                  {it.token.symbol}
                </b>{' '}
                to{' '}
                <a
                  href={`${getNetworkElement(
                    { context, chainId: useWeb3Data.chainId },
                    'etherscanURL'
                  )}address/${it.address}`}
                  target="_blank">
                  {it.address}
                </a>
              </span>
              <a
                onClick={() =>
                  setState((oldValue) => ({
                    ...oldValue,
                    list: state.list.filter((_, idx) => idx !== i),
                  }))
                }>
                X
              </a>
            </div>
          ))}
        </div>
      )}
      <div className={style.TranferETHProp}>
        <div>
          <TokenInputRegular
            selected={state.token}
            onElement={(token, _, value) =>
              setState((oldValue) => ({ ...oldValue, token, value }))
            }
            outputValue={fromDecimals(state.value, 18, true)}
            noBalance
          />
        </div>
        <div>
          <label className={style.AddAReceiver}>
            <span>To</span>
            <input type="text" value={state.address} onChange={setAddress} />
          </label>
        </div>
        <div>
          <a className={style.PlusWallet} onClick={add}>
            +
          </a>
        </div>
      </div>
      <RegularButtonDuo
        onClick={!isDisabled && next}
        className={isDisabled ? 'Disabled' : undefined}>
        Next
      </RegularButtonDuo>
    </>
  )
}

const ProposeDelegationVote = ({ element, setOnClick, stateProvider }) => {
  const context = useEthosContext()

  const useWeb3Data = useWeb3()

  const [state, setState] = stateProvider

  const [totalSupply, setTotalSupply] = useState()

  useEffect(() => {
    setTimeout(async function () {
      setTotalSupply(
        await blockchainCall(
          element.delegationsManager.wrappedToken.mainInterface.methods
            .totalSupply,
          element.delegationsManager.wrappedToken.id
        )
      )
    })
  }, [])

  useEffect(() => {
    if (!state.percentage || !totalSupply) {
      return
    }
    var value = numberToString(
      (parseFloat(state.percentage) / 100) * parseFloat(totalSupply)
    )
    setState((oldValue) => ({ ...oldValue, value }))
  }, [state.percentage, totalSupply])

  function forDelegationVote(el, proposalId, value) {
    value = el.isSurveyless ? 'Yes' : value
    var accept = value === 'Yes'
    var proposalsManagerAddress = el.proposalsManager.options.address
    var collectionAddress = el.proposalsConfiguration.collections[0]
    var objectId = el.proposalsConfiguration.objectIds[0]

    setState((oldValue) => ({ ...oldValue }))

    setState((oldValue) => ({
      ...oldValue,
      selectProposalModal: false,
      token: el.proposalsConfiguration.votingTokens[0],
      balance: '0',
      value: '0',
      selectedProposal: {
        ...el,
        proposalId,
        accept,
        proposalsManagerAddress,
        collectionAddress,
        objectId,
      },
    }))
  }

  function next() {
    if (state.value === '0') {
      throw 'Value must be greater than 0'
    }
    const {
      accept,
      proposalId,
      proposalsManagerAddress,
      collectionAddress,
      objectId,
    } = state.selectedProposal

    const data = {
      accept,
      proposalId,
      proposalsManagerAddress,
      collectionAddress,
      objectId,
      value: state.value,
      vote: true,
      afterTermination: false,
    }
    setOnClick(
      () => (additionalMetadata) =>
        proposeVote(
          { context, ipfsHttpClient: useWeb3Data.ipfsHttpClient },
          element,
          additionalMetadata,
          data
        )
    )
  }

  function onPercentage(e) {
    var percentage = e.currentTarget.value
    setState((oldValue) => ({ ...oldValue, percentage }))
  }

  return (
    <>
      {state.selectProposalModal && (
        <RegularModal
          close={() =>
            setState((oldValue) => ({
              ...oldValue,
              selectProposalModal: false,
            }))
          }>
          <div className={style.MinimalGovernanceContainer}>
            <GovernanceContainer
              element={element.delegationsManager.organization}
              forDelegationVote={forDelegationVote}
            />
          </div>
        </RegularModal>
      )}
      <h4>Vote as a Delegation</h4>
      <div className={style.SelectProposal}>
        <div className={style.SelectProposal}>
          <span>
            {state.selectedProposal
              ? state.selectedProposal.name
              : 'Select a governance proposal of the Organization to propose to vote on as a delegation, using the Organization’s governance tokens staked in your delegation.'}
          </span>
        </div>
        <div>
          <a
            className={style.RegularButtonDuo}
            onClick={() =>
              setState((oldValue) => ({
                ...oldValue,
                selectProposalModal: true,
              }))
            }>
            Select
          </a>
        </div>
        {state.selectedProposal && (
          <div>
            {false && (
              <TokenInputRegular
                tokens={[state.token]}
                selected={state.token}
                onElement={(token, balance, value) =>
                  setState((oldValue) => ({
                    ...oldValue,
                    token,
                    balance,
                    value,
                  }))
                }
                outputValue={fromDecimals(
                  state.value,
                  state.token.decimals,
                  true
                )}
                noBalance
              />
            )}
            <input
              type="range"
              value={state.percentage}
              onChange={onPercentage}
            />
            {state.value && (
              <span>
                {state.percentage}% ({fromDecimals(state.value, 18)} $
                {element.delegationsManager.supportedToken.symbol})
              </span>
            )}
            <RegularButtonDuo onClick={next}>Next</RegularButtonDuo>
          </div>
        )}
      </div>
    </>
  )
}

export default ({ element, forDelegationVote, refreshElements }) => {
  const context = useEthosContext()

  const useWeb3Data = useWeb3()

  const [create, setCreate] = useState(false)
  const [upshots, setUpshots] = useState(null)

  const [wrapWithdrawModal, setWrapWithdrawModal] = useState()
  const [proposalModal, setProposalModal] = useState()

  const isTransfer = useMemo(
    () => element.name === 'Transfer assets within the Treasury Manager',
    [element.name]
  )

  var proposalType = element.isSurveyless ? 'surveyless' : 'survey'
  var type = element.organization.type

  var buyOrSell =
    element.name === 'Investment Fund Routine Buy'
      ? true
      : element.name === 'Investment Fund Routine Sell'
      ? false
      : null

  useEffect(() => {
    if (!element?.isSurveyless) {
      return
    }
    setTimeout(async () => {
      try {
        var data = await getData(
          { provider: element.proposalsManager.currentProvider },
          element.validatorsAddresses[0][0]
        )
        if (data.label === 'BY_QUORUM') {
          var checkerData = getCheckerData(
            element.validatorsAddresses[0][0],
            element
          )
          checkerData = abi.decode(['uint256', 'bool'], checkerData)
          data.valueUint256 = checkerData[0].toString()
        }
        var percentage = parseFloat(fromDecimals(data.valueUint256, 18))
        var votingToken = element.proposalsConfiguration.votingTokens[0]
        var total = parseFloat(
          await blockchainCall(
            (votingToken.interoperableInterface || votingToken.contract).methods
              .totalSupply
          )
        )
        total *= percentage
        total = numberToString(total).split('.')[0]

        var proposalData = await retrieveProposals(
          element.proposalsManager,
          element.presetProposals
        )

        setUpshots(
          proposalData.map((it, i) => ({
            label: element.subProposals[i].label,
            value: it.accept,
            total,
          }))
        )
      } catch (e) {
        setUpshots([])
      }
    })
  }, [useWeb3Data.block, element?.isSurveyless])

  return (
    <div className={style.GovLeft} style={{alignItems: 'baseline'}}>
      {wrapWithdrawModal && (
        <WrapWithdrawModal
          close={() => setWrapWithdrawModal()}
          noApproveNeeded={
            wrapWithdrawModal === 'Withdraw' ||
            element.delegationsManager.supportedTokenData[0] !==
              VOID_ETHEREUM_ADDRESS
          }
          title={wrapWithdrawModal}
          tokenSymbol={element.delegationsManager.supportedToken.symbol}
          other={
            element.organization.components.delegationTokensManager.address
          }
          selectedToken={
            element.delegationsManager[
              `${wrapWithdrawModal === 'Wrap' ? 'supported' : 'wrapped'}Token`
            ]
          }
          onClick={(token) =>
            modalOnClick[wrapWithdrawModal](
              { ...useWeb3Data, element, context },
              token
            )
          }
        />
      )}

      {proposalModal && (
        <RegularModal close={() => setProposalModal()}>
          <ProposalMetadata
            {...{
              onSuccess() {
                setProposalModal()
                refreshElements && refreshElements()
              },
              element,
              Component:
                proposalModal === 'Transfer'
                  ? ProposeDelegationTransfer
                  : ProposeDelegationVote,
            }}
          />
        </RegularModal>
      )}

      {((!forDelegationVote && buyOrSell !== null) || isTransfer) && (
        <div  className={style.forDelegationVoteWraper}>
          <ActionAWeb3Button
          
          onClick={() =>
            isTransfer ? setProposalModal('Transfer') : setCreate(true)
          }>
          Create
        </ActionAWeb3Button>
        </div>
       
      )}
      {create && (
        <TokenBuyOrSell
          {...{ element, buyOrSell, close: () => setCreate(false) }}
        />
      )}
      {(proposalType === 'surveyless' || proposalType === 'poll') &&
        !upshots && <CircularProgress />}
      {(proposalType === 'surveyless' || proposalType === 'poll') && upshots && (
        <div className={style.Upshots}>
          <p>Upshots</p>
          {upshots.map((it) => (
            <Upshots
              key={it.label}
              title={it.label}
              value={it.value}
              total={it.total}
            />
          ))}
        </div>
      )}

      {type === 'delegation' &&
        element.delegationsManager &&
        element.delegationsManager.wrappedToken &&
        element.organization.host === useWeb3Data.account && (
          <>
            <div className={style.HostToolsDelegations}>
              <b>Host Tools</b>
              <RegularButtonDuo onClick={() => setProposalModal('Transfer')}>
                Propose Transfer
              </RegularButtonDuo>
              <RegularButtonDuo onClick={() => setProposalModal('Vote')}>
                Propose Vote
              </RegularButtonDuo>
            </div>
          </>
        )}

      {type === 'delegation' && element.delegationsManager && (
        <>
          <div className={style.DelegationWrap}>
            <div className={style.DelegationWrapBox}>
              <p>
                {!element.delegationsManager.wrappedToken
                  ? 'Be the first to '
                  : ''}
                Stake your {element.delegationsManager.supportedToken.symbol} to
                receive this Delegation’s governance tokens..
              </p>
              <RegularButtonDuo onClick={() => setWrapWithdrawModal('Wrap')}>
                Wrap
              </RegularButtonDuo>
            </div>
            {element.delegationsManager.wrappedToken && (
              <div className={style.DelegationWrapBox}>
                <p>
                  Unwrap your {element.delegationsManager.supportedToken.symbol}{' '}
                  to receive it back and return the Delegation’s governance
                  tokens.
                </p>
                <RegularButtonDuo
                  onClick={() => setWrapWithdrawModal('Withdraw')}>
                  Unwrap
                </RegularButtonDuo>
              </div>
            )}
          </div>
        </>
      )}

      {(element?.delegationsManager?.wrappedToken ||
        element.organization.proposalsConfiguration.votingTokens.length >
          0) && (
        <div className={style.VotingPowersList}>
          <p>
            <b>Voting Powers:</b>
          </p>
          <VotingPowersList
            votingTokens={
              element?.delegationsManager?.wrappedToken
                ? [{ ...element.delegationsManager.wrappedToken, weight: 1 }]
                : element.organization.proposalsConfiguration.votingTokens
            }
          />
        </div>
      )}
      {proposalType !== 'poll' &&
        (type !== 'delegation' || element.delegationsManager) && (
          <div className={style.Rules}>
            <p>
              <b>Governance Rules:</b>
            </p>
            <GovernanceRules element={element} />
          </div>
        )}
    </div>
  )
}
