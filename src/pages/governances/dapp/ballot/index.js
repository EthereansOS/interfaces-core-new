import React from 'react'

import Web3DependantList from '../../../../components/Global/Web3DependantList'
import { useEthosContext, useWeb3, shortenWord } from 'interfaces-core'
import LogoRenderer from '../../../../components/Global/LogoRenderer'

import { all } from '../../../../logic/ballot'

import style from '../../../../components/Global/ObjectsLists/objects-lists.module.css'
import { Link } from 'react-router-dom'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const BallotItem = ({ element }) => {
  const context = useEthosContext()
  return (
    <Link
      to={`/organizations/ballots/${element.id}`}
      className={style.TokenObject}>
      <LogoRenderer input={element} />
      <div className={style.ObjectInfo}>
        <div className={style.ObjectInfoCategory}>
          <h5>{element.name}</h5>
          {element.description && (
            <span
              ref={(ref) =>
                ref &&
                (ref.innerHTML = shortenWord(
                  { context, charsAmount: 50 },
                  element.description
                ))
              }></span>
          )}
        </div>
      </div>
    </Link>
  )
}

const Ballots = () => {
  const context = useEthosContext()
  const { getGlobalContract, newContract, chainId } = useWeb3()

  return (
    <div>
      <ScrollToTopOnMount />

      <Web3DependantList
        Renderer={BallotItem}
        provider={() =>
          all({
            context,
            newContract,
            chainId,
            ballotMaker: getGlobalContract('ballotMaker'),
          })
        }
      />
    </div>
  )
}

/*Ballots.menuVoice = {
  label : 'Ballots',
  path : '/organizations/ballots',
  subMenuLabel : 'All',
  contextualRequire : () => require.context('./', false, /.js$/),
  index : 3
}*/

export default Ballots
