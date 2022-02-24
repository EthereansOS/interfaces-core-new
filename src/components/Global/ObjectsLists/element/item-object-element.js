import style from '../../../../all.module.css'

import { getNetworkElement, useEthosContext, useWeb3, fromDecimals } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../LogoRenderer'

export default ({element, onClick, noBalance}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()
  return (
    <a className={style.TokenObject} onClick={() => onClick && onClick(element)}>
      <LogoRenderer input={element}/>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{element.name} ({element.symbol})</h5>
          <a>Etherscan</a>
          <a className={style.LinkCool} target="_blank" href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`}>Item</a>
        </div>
        <div style={{"visibility" : noBalance ? "hidden" : "visible"}} className={style.ObjectInfoBalance}>
          <p>{fromDecimals(element.balance, element.decimals)}</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}