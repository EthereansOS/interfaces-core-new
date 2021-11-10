import style from '../objects-lists.module.css'

import { shortenWord, useEthosContext } from '@ethereansos/interfaces-core'

export default ({element}) => {
    var context = useEthosContext()
    return (
        <a className={style.TokenObject}>
            <figure>
                <img src={element.image}></img>
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