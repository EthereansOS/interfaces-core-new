import React, { useMemo, useState, useCallback, useEffect } from 'react'

import { Link, useHistory } from 'react-router-dom'
import TokenInputRegular from '../../../Global/TokenInputRegular'
import ActionAWeb3Buttons from '../../../Global/ActionAWeb3Buttons'

import { blockchainCall, useWeb3, abi, web3Utils } from 'interfaces-core'
import { wrapNFT } from '../../../../logic/itemsV2'

import OurCircularProgress from '../../../Global/OurCircularProgress'

import style from '../../../../all.module.css'

export default props => {

    const { nftType, token } = props

    const history = useHistory()

    const web3Data = useWeb3()

    const { getGlobalContract, account, web3 } = web3Data

    const originalType = useMemo(() => nftType || 'ERC1155', [nftType])

    const deckMode = useMemo(() => originalType.indexOf('Deck') !== -1, [originalType])

    const type = useMemo(() => originalType.split('Deck').join(''), [originalType])

    const wrapper = useMemo(() => getGlobalContract(`${type[0].toLowerCase() + type.substring(1)}Wrapper${deckMode ? 'Deck' : ''}`), [type, deckMode, getGlobalContract])

    const [data, setData] = useState()
    const [reserve, setReserve] = useState()
    const [settings, setSettings] = useState()
    const [deckAlreadyWrapped, setDeckAlreadyWrapped] = useState()

    useEffect(() => setData(token ? { token } : null), [token, originalType])

    const onElement = useCallback(async function onElement(token, balance, value) {
        setDeckAlreadyWrapped()
        if(!token) {
            return setData()
        }
        if(deckMode) {
            setData(oldValue => !oldValue || (oldValue.token && (oldValue.token.address !== token.address || oldValue.token.id !== token.id)) ? {} : oldValue)
            var itemId
            try {
                itemId = await blockchainCall(wrapper.methods.itemIdOf, token.tokenAddress || token.address)
            } catch(e) {
                itemId = await blockchainCall(wrapper.methods.itemIdOf, token.tokenAddress || token.address, token.id)
            }
            if(itemId !== '0') {
                setData()
                const tokenAddress = abi.decode(["address"], abi.encode(["uint256"], [itemId]))[0]
                setDeckAlreadyWrapped(tokenAddress)
                history.push('/items/decks/' + tokenAddress)
            }
        }
        setData({token, balance : type.indexOf("721") !== -1 ? token?.id || '1' : balance, value : type.indexOf("721") !== -1 ? token?.id || '1' : value})
    }, [deckMode, type, wrapper])

    async function onSuccess(transaction) {
        const transactionReceipt = await web3.eth.getTransactionReceipt(transaction.transactionHash || transaction)
        const logs = transactionReceipt.logs
        const topic = web3Utils.sha3('CollectionItem(bytes32,bytes32,uint256)')
        const mint = logs.filter(it => it.topics[0] === topic)[0]
        if(mint) {
            const tokenAddress = abi.decode(["address"], mint.topics[3])[0]
            var link = '/items/'
            if(originalType.indexOf('Deck') !== -1) {
                link += 'decks/'
            }
            link = link + tokenAddress
            history.push(link)
        }
    }

    return (
        <div className={style.CreationPageLabel}>
        <div className={style.WrapSection}>
            <div className={style.FancyExplanationCreate}> 
            <h2>Wrap {token ? token.symbol : `${type.split('ERC').join('ERC-')} Tokens into ${deckMode ? 'Decks' : 'Items'}`}</h2> 
            </div>
            <TokenInputRegular tokenOnly={type.indexOf("721") !== -1} selected={data?.token} tokens={token ? [token] : undefined} onElement={onElement} onlySelections={[type.split('ERC').join('ERC-')]}/>
            {data && !data.token && <OurCircularProgress/>}
            {data && data.token && <ActionAWeb3Buttons onSuccess={onSuccess} noApproveNeeded={type.indexOf("721") === -1} token={data.token} other={wrapper} balance={data.balance} value={data.value} buttonText="Wrap" onClick={() => wrapNFT({ account }, data.token, data.balance, data.value, wrapper, originalType, reserve)}/>}
            {deckAlreadyWrapped && <div className={style.FancyExplanationCreate}>
                <p>This token has been already wrapped</p>
                <Link to={`/items/decks/${deckAlreadyWrapped}/wrap`}>Navigate to Deck page</Link>
            </div>}
            {deckMode && <div>
                <label className={style.SettingBLabPerch} style={{textAlign: 'left'}}>
                    <p title="Reserved NFT’s can only be unwrapped by the reserver for 10 days, after that, anyone one with a deck Item of that collection may unwrap that NFT." ><input type="checkbox" style={{position: 'relative', top: '2px', width: 'auto', marginRight: '3px'}} checked={reserve} onClick={e => setReserve(e.currentTarget.checked)}/>🔒 Reserve for 10 days</p>
                </label>
            </div>}
            {false && data && data.token && deckMode && <>
                <div className={style.ActionInfoSection}>
                    <a className={style.ActionInfoSectionSettings} onClick={() => setSettings(!settings)}>
                        <figure>
                            <img src={`${process.env.PUBLIC_URL}/img/settings.svg`}></img>
                        </figure>
                    </a>
                </div>
                {settings && <div className={style.SettingFB}>
                    <label className={style.SettingBLabPerch}>
                        <p><input type="checkbox" checked={reserve} onClick={e => setReserve(e.currentTarget.checked)}/> Reserve</p>
                    </label>
                </div>}
            </>}
        </div>
        </div>
    )
}