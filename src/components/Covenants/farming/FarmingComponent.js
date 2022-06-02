import React, { useState, useEffect, useMemo } from 'react'

import { Link } from 'react-router-dom'

import { formatMoney, useEthosContext, useWeb3, getNetworkElement, fromDecimals, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

import LogoRenderer from '../../Global/LogoRenderer'
import SetupComponent from './SetupComponent'
import RegularButtonDuo from '../../Global/RegularButtonDuo'
import RegularModal from '../../Global/RegularModal'
import Create from '../../../pages/covenants/dapp/farming/create'

import { copyToClipboard, addTokenToMetamask } from '../../../logic/uiUtilities'

import style from '../../../all.module.css'

export default props => {

    const { element, opened, setOpened, rewardTokenAddress, refresh } = props

    const context = useEthosContext()

    const web3Data = useWeb3()

    const { chainId, account } = web3Data

    const [showOldSetups, setShowOldSetups] = useState()

    const dailyReward = useMemo(() => element.rewardPerBlock.ethereansosMul(6400), [element && element.rewardPerBlock])

    const logoContainer = useMemo(() => {
        var result = <LogoRenderer input={element.rewardToken}/>
        return element.rewardTokenAddress === VOID_ETHEREUM_ADDRESS ? result : element.rewardToken.mainInterface ? <Link to={`/items/dapp/items/${element.rewardToken.id}`}>{result}</Link> : <a target="_blank" href={`${getNetworkElement({ context, chainId}, 'etherscanURL')}token/${element.rewardToken.address}`}>{result}</a>
    }, [element && element.rewardTokenAddress])

    const [edit, setEdit] = useState()

    return (<>
        {edit && <RegularModal close={() => setEdit()}>
            <Create element={element} onEditSuccess={() => void(setEdit(), refresh && refresh())}/>
        </RegularModal>}
        <div className={style.FarmContent}>
            <div className={style.FarmContentTitle}>
                {logoContainer}
                <aside>
                    <h6>Farm {element.rewardToken.mainInterface ? `${element.rewardToken.name} (${element.rewardToken.symbol})` : `${element.rewardToken.symbol} (${element.rewardToken.name})`}</h6>
                    {setOpened && <a className={style.RegularButtonDuo} onClick={() => setOpened(opened ? undefined : element)}>{opened ? "Back" : "Open"}</a>}
                    {element.host === account && <a className={style.RegularButtonDuo} onClick={() => setEdit(true)}>Edit</a>}
                </aside>
            </div>
            <div className={style.FarmContentInfo}>
                {element.setups.filter(it => it.active || it.canActivateSetup) === 0 ? <>
                    <p>
                        <span className={style.FarmActivityA}>Inactive</span>
                        {element.generation === 'gen2' && <span className={style.VersionFarm}>Uni V3{element.isRegular === null ? "" : ` ${element.isRegular ? "" : "Shared"}`}</span>}
                        {element.generation === 'gen1' && <span className={style.VersionFarm}>Gen 1</span>}
                    </p>
                </> : <>
                    {dailyReward !== "0" && <p><b>Daily Rate</b>: {formatMoney(fromDecimals(dailyReward, element.rewardToken.decimals, true), 6)} <span>{element.rewardToken.symbol}</span></p>}
                    <p>
                        <span className={style.FarmActivityA}>Active ({element.freeSetups.length + element.lockedSetups.length})</span>
                        {element.generation === 'gen2' && <span className={style.VersionFarm}>Uni V3{element.isRegular === null ? "" : ` ${element.isRegular ? "" : "Shared"}`}</span>}
                        {element.generation === 'gen1' && <span className={style.VersionFarm}>Gen 1</span>}
                        {setOpened && <a className={style.MetaBTN} onClick={() => addTokenToMetamask({ context, ...web3Data }, element.rewardTokenAddress, context.trustwalletImgURLTemplate.split('{0}').join(element.rewardTokenAddress))}>Metamask</a>}
                        {setOpened && <a className={style.CopyBTN} onClick={() => copyToClipboard(`${window.location.href}/${element.address}`)}>Link</a>}
                    </p>
                </>}
                <div>
                    {element.rewardTokenAddress !== VOID_ETHEREUM_ADDRESS && element.rewardToken.mainInterface && <a className={style.ExtLinkButton} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}token/${element.rewardTokenAddress}`}> Item</a>}
                    {element.rewardTokenAddress !== VOID_ETHEREUM_ADDRESS && !element.rewardToken.mainInterface && <a className={style.ExtLinkButton} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}token/${element.rewardTokenAddress}`}> ERC20</a>}
                    <a className={style.ExtLinkButton} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}address/${element.address}`}>Contract</a>
                    <a className={style.ExtLinkButton} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}address/${element.host}`}>Host</a>
                    <a className={style.ExtLinkButton} target="_blank" href={`${getNetworkElement({ context, chainId }, "etherscanURL")}address/${element.extensionAddress}`}>Extension</a>
                </div>
            </div>
            {(!setOpened || opened) && <div>
                <div>
                    {element.setups.filter(it => it.active || it.canActivateSetup).map(it => <SetupComponent key={it.setupIndex + "_" + element.key} {...{
                        ...props,
                        setupInput: it,
                        element,
                        refresh
                    }} />)}
                </div>
                {!rewardTokenAddress && element.setups.filter(it => !it.active && !it.canActivateSetup).length > 0 && <>
                    <div className={style.OldSetups}>
                        <RegularButtonDuo onClick={() => setShowOldSetups(!showOldSetups)}>{showOldSetups ? "Hide" : "Show"} old setups</RegularButtonDuo>
                        {showOldSetups && element.setups.filter(it => !it.active && !it.canActivateSetup).map(it => <SetupComponent key={it.setupIndex + "_" + element.key} {...{
                            ...props,
                            setupInput: it,
                            element,
                            refresh
                        }} />)}
                    </div>
                </>}
            </div>}
        </div>
    </>)
}