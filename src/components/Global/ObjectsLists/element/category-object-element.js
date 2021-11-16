import style from '../objects-lists.module.css'

import { shortenWord, useEthosContext } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../LogoRenderer'

export default ({element}) => {
    var context = useEthosContext()
    return (
        <a className={style.TokenObject}>
            <figure>
                <LogoRenderer input={element}/>
            </figure>
            <div className={style.ObjectInfo}>
                <div className={style.ObjectInfoCategory}>
                    <h5>{element.name}</h5>
                    {element.description && <span ref={ref => ref && (ref.innerHTML = shortenWord({ context, charsCount : 50}, element.description))}></span>}
                </div>
            </div>
        </a>
    )
}