import style from '../../../../all.module.css'

import { getNetworkElement, useEthosContext, useWeb3 } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../LogoRenderer'

export default ({element}) => {
  const context = useEthosContext()
  const { chainId } = useWeb3()
  return (
    <a className={style.TokenObject}>
      <LogoRenderer input={element}/>
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoAndLink}>
          <h5>{element.name} ({element.symbol})</h5>
          <a>Etherscan</a>
          <a className={style.LinkCool} target="_blank" href={`${getNetworkElement({context, chainId}, "etherscanURL")}/token/${element.address}`}>Item</a>
        </div>
        <div className={style.ObjectInfoBalance}>
          <p>{0}</p>
          <span>Balance</span>
        </div>
      </div>
    </a>
  )
}