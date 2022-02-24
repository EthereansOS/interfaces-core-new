import style from '../../../../all.module.css'

import { fromDecimals, getNetworkElement, useEthosContext, useWeb3, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

import CircularProgress from '../../OurCircularProgress'
import LogoRenderer from '../../LogoRenderer'

export default ({element, onClick, noBalance}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()
  return (
    <a className={style.TokenObject} onClick={() => onClick(element)}>
      <LogoRenderer input={element}/>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{element.name} ({element.symbol})</h5>
          {element.address !== VOID_ETHEREUM_ADDRESS && <a href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`} target="blank">Etherscan</a>}
        </div>
        {!noBalance && !element.balance && <CircularProgress/>}
        {!noBalance && element.balance && <div style={{"visibility" : "visible"}} className={style.ObjectInfoBalance}>
          <p>{fromDecimals(element.balance, element.decimals)}</p>
          <span>Balance</span>
        </div>}
      </div>
    </a>
  )
}