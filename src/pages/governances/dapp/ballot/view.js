import React, { useEffect, useState } from 'react'

import Web3DependantList from '../../../../components/Global/Web3DependantList'
import { abi, useEthosContext, useWeb3, toDecimals, fromDecimals, blockchainCall, VOID_ETHEREUM_ADDRESS } from 'interfaces-core'
import { useLocation } from 'react-router'

import {getProposal, preparePermit} from '../../../../logic/ballot'

const BallotViewElement = ({element}) => {

    async function terminate() {
        try {
            await blockchainCall(element.proposalsManager.methods.terminate, element.proposalIds)
        } catch(e) {
            alert(e.message || e)
        }
    }
    return (
        <div>
            <h1>{element.name}</h1>
            <h3>{element.description}</h3>
            <span>End block: <a href={"https://rinkeby.etherscan.io/block/" + element.endBlock} target="_blank">#{element.endBlock}</a></span>
            {element.terminated && "Terminated"}
            <a onClick={terminate}>Terminate</a>
            {element.proposals.map(it => <Prop key={it.id} proposal={it} proposalsManager={element.proposalsManager}/>)}
        </div>
    )
}

const Prop = ({proposal, proposalsManager}) => {
    return (
        <div>
            <h4>{proposal.value}</h4>
            <br/>
            Termination Block: {proposal.terminationBlock}
            <br/>
            VotingTokens:
            {proposal.votingTokens.map(it => <VotingToken key={it.address} element={it} proposalId={proposal.id} proposalsManager={proposalsManager}/>)}
        </div>
    )
}

const VotingToken = ({proposalId, proposalsManager, element}) => {
    const {getGlobalContract, newContract, chainId, account, block} = useWeb3()

    const [acceptsInput, setAcceptsInput] = useState(0)
    const [refusesInput, setRefusesInput] = useState(0)
    const [permitSignature, setPermitSignature] = useState(null)

    const [address, setAddress] = useState(null)

    const [accepts, setAccepts] = useState(0)
    const [refuses, setRefuses] = useState(0)
    const [toWithdraw, setToWithdraw] = useState(0)

    var contract = element.interoperableInterface || element.contract

    useEffect(() => {
        async function ask() {
            var x = await blockchainCall(proposalsManager.methods.votes, [proposalId], [account], [[element.itemKey]])
            setAccepts(fromDecimals(x[0][0], element.decimals, true))
            setRefuses(fromDecimals(x[1][0], element.decimals, true))
            setToWithdraw(fromDecimals(x[2][0], element.decimals, true))
        }
    }, [account, chainId, block])

    async function approve() {
        setPermitSignature(null)
        var acc = toDecimals(acceptsInput || "0", element.decimals)
        var ref = toDecimals(refusesInput || "0", element.decimals)
        var value = acc.ethereansosAdd(ref)
        try {
            await blockchainCall(contract.methods.approve, proposalsManager.options.address, value)
        } catch(e) {
            alert(e.message || e)
        }
    }

    async function permit() {
        setPermitSignature(null)
        var acc = toDecimals(acceptsInput || "0", element.decimals)
        var ref = toDecimals(refusesInput || "0", element.decimals)
        var value = acc.ethereansosAdd(ref)
        try {
            var permitSignature = await preparePermit({account, chainId}, contract, proposalsManager.options.address, value)
            console.log(permitSignature)
            setPermitSignature(permitSignature)
        } catch(e) {
            alert(e.message || e)
        }
    }

    async function vote() {
        var acc = toDecimals(acceptsInput || "0", element.decimals)
        var ref = toDecimals(refusesInput || "0", element.decimals)
        var value = acc.ethereansosAdd(ref)
        var permitSignatureData = "0x"
        try {
            permitSignatureData = abi.encode(["uint8", "bytes32", "bytes32", "uint256"], [permitSignature.v, permitSignature.r, permitSignature.s, permitSignature.deadline])
        } catch(e) {
        }
        try {
            if(element.passedAsERC20 || element.address === VOID_ETHEREUM_ADDRESS) {
                await blockchainCall(proposalsManager.methods.vote, element.address, permitSignatureData, proposalId, acc, ref, address || VOID_ETHEREUM_ADDRESS, false, {value : element.address === VOID_ETHEREUM_ADDRESS ? value : '0'})
            } else {
                var data = abi.encode(["bytes32", "uint256", "uint256", "address", "bool"], [proposalId, acc, ref, address || VOID_ETHEREUM_ADDRESS, false])
                await blockchainCall(element.mainInterface.methods.safeTransferFrom, account, proposalsManager.options.address, element.id, value, data)
            }
            setPermitSignature(null)
        } catch(e) {
            alert(e.message || e)
        }
    }

    async function withdraw() {
        try {
            await blockchainCall(proposalsManager.methods.withdrawAll, [proposalId], address || VOID_ETHEREUM_ADDRESS)
        } catch(e) {
            alert(e.message || e)
        }
    }

    return (
        <div>
            {element.name} ({element.symbol})
            <br/>
            {element.mainInterface && "Item"}
            <br/>
            {element.passedAsERC20 && "You will vote as Erc20"}
            <div>
                Accepts
                <input type="number" value={acceptsInput} onChange={e => setAcceptsInput(e.currentTarget.value)}/>
            </div>
            <div>
                Refuses
                <input type="number" value={refusesInput} onChange={e => setRefusesInput(e.currentTarget.value)}/>
            </div>
            <div>
                Address:
                <input type="address" value={address} onChange={e => setAddress(e.currentTarget.value)}/>
            </div>
            <div>
                Accepts: {accepts}
                <br/>
                Refuses: {refuses}
                <br/>
                To Withdraw: {toWithdraw}
            </div>
            {!element.mainInterface && <a onClick={approve}>Approve</a>}
            {element.passedAsERC20 && <a onClick={permit}>Permit</a>}
            <a onClick={vote}>Vote</a>
            <a onClick={withdraw}>Withdraw</a>
        </div>
    )
}

const BallotView = () => {

    const context = useEthosContext()
    const {getGlobalContract, newContract, web3, account} = useWeb3()

    const {pathname} = useLocation()

    var id = pathname.split('/')
    id = id[id.length - 1]

    return <Web3DependantList
        Renderer={BallotViewElement}
        provider={() => getProposal({ web3, account, context, newContract, contract : getGlobalContract('ballotMaker')}, id)}
    />
}

BallotView.menuVoice = {
  path : '/guilds/ballots/:id',
}

export default BallotView