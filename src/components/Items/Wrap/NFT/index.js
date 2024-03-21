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
        if (!token) {
            return setData()
        }
        if (deckMode) {
            setData(oldValue => !oldValue || (oldValue.token && (oldValue.token.address !== token.address || oldValue.token.id !== token.id)) ? {} : oldValue)
            var itemId
            try {
                itemId = await blockchainCall(wrapper.methods.itemIdOf, token.tokenAddress || token.address)
            } catch (e) {
                itemId = await blockchainCall(wrapper.methods.itemIdOf, token.tokenAddress || token.address, token.id)
            }
            if (itemId !== '0') {
                setData()
                const tokenAddress = abi.decode(["address"], abi.encode(["uint256"], [itemId]))[0]
                setDeckAlreadyWrapped(tokenAddress)
                history.push('/items/decks/' + tokenAddress)
            }
        }
        setData({ token, balance: type.indexOf("721") !== -1 ? token?.id || '1' : balance, value: type.indexOf("721") !== -1 ? token?.id || '1' : value })
    }, [deckMode, type, wrapper])

    async function onSuccess(transaction) {
        const transactionReceipt = await web3.eth.getTransactionReceipt(transaction.transactionHash || transaction)
        const logs = transactionReceipt.logs
        const topic = web3Utils.sha3('CollectionItem(bytes32,bytes32,uint256)')
        const mint = logs.filter(it => it.topics[0] === topic)[0]
        if (mint) {
            const tokenAddress = abi.decode(["address"], mint.topics[3])[0]
            var link = '/items/'
            if (originalType.indexOf('Deck') !== -1) {
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
                <TokenInputRegular tokenOnly={type.indexOf("721") !== -1} selected={data?.token} tokens={token ? [token] : undefined} onElement={onElement} onlySelections={[type.split('ERC').join('ERC-')]} />
                {data && !data.token && <OurCircularProgress />}
                {data && data.token && <ActionAWeb3Buttons onSuccess={onSuccess} noApproveNeeded={type.indexOf("721") === -1} token={data.token} other={wrapper} balance={data.balance} value={data.value} buttonText="Wrap" onClick={() => wrapNFT({ account }, data.token, data.balance, data.value, wrapper, originalType, reserve)} />}
                {deckAlreadyWrapped && <div className={style.FancyExplanationCreate}>
                    <p>This token has been already wrapped</p>
                    <Link to={`/items/decks/${deckAlreadyWrapped}/wrap`}>Navigate to Deck page</Link>
                </div>}
                {deckMode && <div>
                    <label className={style.SettingBLabPerch} style={{ textAlign: 'left' }}>
                        <p title="Reserved NFT’s can only be unwrapped by the reserver for 10 days, after that, anyone one with a deck Item of that collection may unwrap that NFT." ><input type="checkbox" style={{ position: 'relative', top: '2px', width: 'auto', marginRight: '3px' }} checked={reserve} onClick={e => setReserve(e.currentTarget.checked)} /> Reserve for 10 days
                            <svg className={style.InfoAreaIcon} version="1.1" id="Capa_1"
                                width="20px" height="20px" viewBox="0 0 93.936 93.936"
                                >
                                <g>
                                    <path d="M80.179,13.758c-18.342-18.342-48.08-18.342-66.422,0c-18.342,18.341-18.342,48.08,0,66.421
                                        c18.342,18.342,48.08,18.342,66.422,0C98.521,61.837,98.521,32.099,80.179,13.758z M44.144,83.117
                                        c-4.057,0-7.001-3.071-7.001-7.305c0-4.291,2.987-7.404,7.102-7.404c4.123,0,7.001,3.044,7.001,7.404
                                        C51.246,80.113,48.326,83.117,44.144,83.117z M54.73,44.921c-4.15,4.905-5.796,9.117-5.503,14.088l0.097,2.495
                                        c0.011,0.062,0.017,0.125,0.017,0.188c0,0.58-0.47,1.051-1.05,1.051c-0.004-0.001-0.008-0.001-0.012,0h-7.867
                                        c-0.549,0-1.005-0.423-1.047-0.97l-0.202-2.623c-0.676-6.082,1.508-12.218,6.494-18.202c4.319-5.087,6.816-8.865,6.816-13.145
                                        c0-4.829-3.036-7.536-8.548-7.624c-3.403,0-7.242,1.171-9.534,2.913c-0.264,0.201-0.607,0.264-0.925,0.173
                                        s-0.575-0.327-0.693-0.636l-2.42-6.354c-0.169-0.442-0.02-0.943,0.364-1.224c3.538-2.573,9.441-4.235,15.041-4.235
                                        c12.36,0,17.894,7.975,17.894,15.877C63.652,33.765,59.785,38.919,54.73,44.921z"/>
                                </g>
                            </svg>
                        </p>
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
                            <p><input type="checkbox" checked={reserve} onClick={e => setReserve(e.currentTarget.checked)} /> Reserve</p>
                        </label>
                    </div>}
                </>}
            </div>
        </div>
    )
}