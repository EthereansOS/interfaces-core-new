import React, { useState } from 'react'

import { Link } from 'react-router-dom'
import DappSubMenu from '../../../../components/Global/DappSubMenu'

import style from '../../../../all.module.css'

const Wrap = ({voices}) => {
  const [currentVoice, setCurrentVoice] = useState(voices[0])
  const { Component, props } = currentVoice
  return (
    <div className={style.CovenantsMainBox}>
        <DappSubMenu isSelected={it => it.id === currentVoice?.id} voices={voices.map(it => ({...it, onClick : () => setCurrentVoice(it)}))}/>
        <Component {...props}/>
    </div>
  )
}

const WrapIndex = ({}) => {

    return (<>
        <div className={style.CreatePage}>
            <div className={style.CreateBoxDesc}>
                <h6>Items</h6>
                <p>Wrap any ERC20, ERC721 or ERC1155 as an Item, allowing it to act as an ERC20, ERC1155 and as a token with unprecedented capabilities.</p>
                <Link className={style.NextStep} to='/items/dapp/wrap/items'>Start</Link>
                <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations" className={style.ExtLinkButtonAlpha}>Learn</a>
            </div>
            <div className={style.CreateBoxDesc}>
                <h6>Decks</h6>
                <p>Wrap any ERC721 or ERC1155 into a Deck, a suite of tokens from an ERC721 or ERC1155 Collection wrapped into a fungible supply of Items.</p>
                <Link className={style.NextStep} to='/items/dapp/wrap/decks'>Start</Link>
                <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations" className={style.ExtLinkButtonAlpha}>Learn</a>
            </div>
        </div>
    </>)
}

WrapIndex.Wrap = Wrap

WrapIndex.menuVoice = {
  label : 'Wrap',
  path : '/items/dapp/wrap',
  contextualRequire : () => require.context('./', false, /.js$/)
}

export default WrapIndex