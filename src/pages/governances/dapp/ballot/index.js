import React from 'react'

import Web3DependantList from '../../../../components/Global/Web3DependantList'
import { useEthosContext, useWeb3, shortenWord } from '@ethereansos/interfaces-core'
import LogoRenderer from '../../../../components/Global/LogoRenderer'

import {all} from '../../../../logic/ballot'

import style from '../../../../components/Global/ObjectsLists/objects-lists.module.css'
import { Link } from 'react-router-dom'

const BallotItem = ({element}) => {
    const context = useEthosContext()
    return (
        <Link to={`/governances/dapp/ballots/${element.id}`} className={style.TokenObject}>
            <LogoRenderer input={element}/>
            <div className={style.ObjectInfo}>
                <div className={style.ObjectInfoCategory}>
                    <h5>{element.name}</h5>
                    {element.description && <span ref={ref => ref && (ref.innerHTML = shortenWord({ context, charsAmount : 50}, element.description))}></span>}
                </div>
            </div>
        </Link>
    )
}

const Ballots = () => {

    const context = useEthosContext()
    const {getGlobalContract, newContract, chainId} = useWeb3()

    return (
        <div>
            <Web3DependantList
                Renderer={BallotItem}
                provider={() => all({context, newContract, chainId, ballotMaker : getGlobalContract('ballotMaker')})}
            />
        </div>
)}

/*Ballots.menuVoice = {
  label : 'Ballots',
  path : '/governances/dapp/ballots',
  subMenuLabel : 'All',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 3
}*/

export default Ballots