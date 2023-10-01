import style from '../../../../all.module.css'

import { shortenWord, useEthosContext } from 'interfaces-core'
import LogoRenderer from '../../LogoRenderer'

export default ({element}) => {
    var context = useEthosContext()
    return (
        <a className={style.TokenObject}>
            <LogoRenderer badge input={element}/>
            <div className={style.ObjectInfo}>
                <div className={style.ObjectInfoCategory}>
                    <h5>{shortenWord({ context, charsAmount : 15}, element.name)}</h5>
                    {element.description && <span ref={ref => ref && (ref.innerHTML = shortenWord({ context, charsAmount : 50}, element.description))}></span>}
                </div>
            </div>
        </a>
    )
}