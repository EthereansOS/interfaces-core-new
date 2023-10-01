import React, { useState, useEffect, useMemo } from 'react'

import style from '../../../all.module.css'
import ItemImage from '../ItemImage'
import RegularButtonDuo from '../../Global/RegularButtonDuo'
import ActionAWeb3Button from '../../Global/ActionAWeb3Button'
import LogoRenderer from '../../Global/LogoRenderer'
import { getNetworkElement, useEthosContext, useWeb3, web3Utils, numberToString } from 'interfaces-core'
import OurCircularProgress from '../../Global/OurCircularProgress'

const ExploreNFT = ({ element, onClick }) => {

  const context = useEthosContext()
  const web3Data = useWeb3()
  const { chainId, block, account, dualBlock } = web3Data

  const currentBlock = useMemo(() => parseInt(dualBlock || block), [dualBlock, block])

  const [rarityScore, setRarityScore] = useState()

  const remainingBlocks = useMemo(() => parseInt(element.reserveData?.timeout || 0) - parseInt(currentBlock), [element.reserveData?.timeout, currentBlock])

  const remainingDays = useMemo(() => {

    if(remainingBlocks <= 6400) {
      return 'by tomorrow'
    }

    var d = numberToString(remainingBlocks / 6400)
    var split = d.split('.')
    d = parseInt(split[0])
    if(split.length > 1) {
      split = parseInt(split[1])
      if(split > 0) {
        d++
      }
    }

    return `in ${d} days`
  }, [remainingBlocks])

  useEffect(() => setTimeout(async function() {
    try {
      const address = element.tokenAddress || element.address
      const id = element.id
      const response = await (await fetch(`https://looksrare.org/api/rarity/assets/${address}?limit=1&page=1&tokenIds=${id}`)).json()
      setRarityScore(response[0].rarityScore)
    } catch(e) {
      setRarityScore('0')
      console.log(e)
    }
  }), [element && element.tokenAddress || element.address, element && element.id])

  return (
    <div className={style.NFTView}>
      <div className={style.NFTImage}>
        <LogoRenderer noFigure input={element}/>
        {(remainingBlocks <= 0) ? <span></span> : <span className={style.Lockedbasics}>🔒</span>}
        {(remainingBlocks <= 0 || web3Utils.toChecksumAddress(account) === web3Utils.toChecksumAddress(element.reserveData.unwrapper)) ? <RegularButtonDuo onClick={() => onClick(element)}>Select</RegularButtonDuo> : <span className={style.Lockedfordays}>🔓 {remainingDays}</span>}
        <div className={style.NFTInfo}>
          {rarityScore && rarityScore !== '0' && <p><b>Rarity:</b> <br/>{rarityScore}</p>}
          {rarityScore === '0' && <p><b>Rarity:</b> <br/>-</p>}
          {false && <a href={`${getNetworkElement({context, chainId}, 'etherscanURL')}address/${element.address}`} target="_blank" className={style.ExtLinkButton}>Info</a>}
          <a href={`https://${chainId === 1 ? '' : 'testnets.'}opensea.io/assets/${element.tokenAddress || element.address}/${element.id}`} target="_blank" className={style.ExtLinkButton}>OpenSea</a>
        </div>
      </div>
    </div>
  )
}

export default ExploreNFT