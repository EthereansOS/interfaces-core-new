import style from '../objects-lists.module.css'

import { fromDecimals, getNetworkElement, useEthosContext, useWeb3, VOID_ETHEREUM_ADDRESS } from '@ethereansos/interfaces-core'

import { CircularProgress } from '@ethereansos/interfaces-ui'
import TokenLogo from '../../TokenLogo'

export default ({element, onClick}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()
  return (
    <a className={style.TokenObject} onClick={() => onClick(element)}>
      <figure>
        <TokenLogo input={element}/>
      </figure>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{element.name} ({element.symbol})</h5>
          {element.address !== VOID_ETHEREUM_ADDRESS && <a href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`} target="blank">Etherscan</a>}
        </div>
        {!element.balance && <CircularProgress/>}
        {element.balance && <div className={style.ObjectInfoBalance}>
          <p>{fromDecimals(element.balance, element.decimals)}</p>
          <span>Balance</span>
        </div>}
      </div>
    </a>
  )
}