import React, { useEffect, useState } from 'react'

import RegularButtonDuo from '../../Global/RegularButtonDuo'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import ActionAWeb3Buttons from '../../Global/ActionAWeb3Buttons'
import Web3DependantList from '../../Global/Web3DependantList'
import LogoRenderer from '../../Global/LogoRenderer'

import { useWeb3, abi, useEthosContext, fromDecimals, formatMoney, blockchainCall, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'
import { getAvailableDelegationsManagers } from '../../../logic/delegation'
import { loadToken } from '../../../logic/itemsV2'

import TokenInputRegular from '../../Global/TokenInputRegular'
import RegularModal from '../../Global/RegularModal'

import style from '../../../all.module.css'
import OurCircularProgress from '../../Global/OurCircularProgress'

const AttachToOrganization = ({delegation, element}) => {

    const context = useEthosContext()

    const { block, chainId, web3, account, newContract, getGlobalContract } = useWeb3()

    const [paidFor, setPaidFor] = useState()
    const [tokenElement, setTokenElement] = useState({token: null, balance : '0', value : '0' })

    const [opened, setOpened] = useState()

    const [attachInsurance, setAttachInsurance] = useState()
    const [token, setToken] = useState()

    useEffect(() => {
        setTimeout(async () => {
            var ai = await blockchainCall(element.delegationsManager.methods.attachInsurance)
            setAttachInsurance(ai)
            var t = await blockchainCall(element.delegationsManager.methods.supportedToken)
            t = await loadToken({context, chainId, web3, account, newContract, getGlobalContract}, t[0], t[1])
            setToken(t)
        })
    }, [])

    useEffect(() => {
        refreshPaidFor()
    }, [block, account])

    function refreshPaidFor() {
        blockchainCall(element.delegationsManager.methods.paidFor, delegation.address, account).then(setPaidFor)
    }

    function retirePayment() {
        return blockchainCall(element.delegationsManager.methods.retirePayment, delegation.address, account, "0x")
    }

    function payFor() {
        const token = tokenElement.token
        const value = tokenElement.value
        if(token.mainInterface) {
            const data = abi.encode(["address", "address"], [delegation.address, account])
            return blockchainCall(token.mainInterface.methods.safeTransferFrom, account, element.delegationsManagerAddress, token.id, value, data)
        }
        return blockchainCall(element.delegationsManager.methods.payFor, delegation.address, value, "0x", account, { value : token.address === VOID_ETHEREUM_ADDRESS ? value : '0'})
    }

    const percentage = !paidFor ? 0 : (parseInt(paidFor.totalPaid)/parseInt(attachInsurance)) * 100

    var readPercentage = percentage > 100 ? 100 : percentage
    readPercentage = formatMoney(readPercentage, 4)

    return (<>
        <a className={style.OrgSingle} onClick={() => setOpened(true)}>
            <LogoRenderer input={element.organization}/>
            <div className={style.OrgTitleEx}>
                <h6>{element.organization.name}</h6>
            </div>
        </a>
        {opened && <RegularModal close={() => setOpened(false)}>
            <div className={style.InfoDelegationAttBox}>
                {!token && <OurCircularProgress/>}
                {token && <>
                    <div className={style.Upshot}>
                        <span>Staked: {fromDecimals(paidFor.totalPaid, token.decimals, true)} ${token.symbol}</span>
                        <div className={style.UpshotBar}>
                            <figure style={{width : readPercentage + "%"}}>{formatMoney(percentage, 4) + "%"}</figure>
                        </div>
                    </div>
                    <p>Requested Insurance: <br></br>{fromDecimals(attachInsurance, token.decimals, true)} ${token.symbol}</p>
                    <div>
                        {percentage < 100 && <>
                            <TokenInputRegular onElement={(token, balance, value) => setTokenElement({ token, balance, value })} tokens={[token]} selected={token}/>
                            <ActionAWeb3Buttons token={tokenElement.token} balance={tokenElement.balance} value={tokenElement.value} other={element.delegationsManagerAddress} onSuccess={refreshPaidFor} onClick={payFor} noApproveNeeded={token.mainInterface !== undefined && token.mainInterface !== null} buttonText="Stake"/>
                        </>}
                        {paidFor.retrieverPaid !== '0' && `You deposited ${fromDecimals(paidFor.retrieverPaid, token.decimals, true)} $${token.symbol}`}
                        {paidFor.retrieverPaid !== '0' && <ActionAWeb3Button onSuccess={refreshPaidFor} onClick={retirePayment}>Unstake</ActionAWeb3Button>}
                    </div>
                </>}
            </div>
        </RegularModal>}
    </>)
}

export default ({element}) => {

    const context = useEthosContext()

    const { chainId, web3, account, getGlobalContract, newContract } = useWeb3()

    const [opened, setOpened] = useState(false)

    const [list, setList] = useState()

    return (<>
        <div className={style.GovCardS}>
            <div className={style.GovCardHead}>
                <div className={style.GovCardHeadDelegation}>
                    <span>Explore new grants</span>
                
                <div className={style.DelegationWalletsCardBTN}>
                    <RegularButtonDuo onClick={() => setOpened(!opened)}>{opened ? "Close" : "Open"}</RegularButtonDuo>
                </div>
                </div>
            </div>
            {opened && <div className={style.GovCardOpened}>
                <div className={style.OrganizationsExploreMain}>
                    <div className={style.OrgAllSingle}>
                        <Web3DependantList
                            Renderer={AttachToOrganization}
                            renderedProperties={{delegation : element}}
                            provider={() => list || getAvailableDelegationsManagers({ context, chainId, web3, account, getGlobalContract, newContract }, element.address).then(l => {
                                setList(l)
                                return l
                            })}
                            emptyMessage={<p>Available grants: 0</p>}
                        />
                    </div>
                </div>
            </div>}
        </div>
    </>)
}