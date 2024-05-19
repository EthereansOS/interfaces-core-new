import React, { useCallback, useEffect, useState, useMemo } from 'react'

import Web3DependantList from '../../../../components/Global/Web3DependantList'

import {
  getNetworkElement,
  useEthosContext,
  useWeb3,
  formatMoney,
  fromDecimals,
  web3Utils,
} from 'interfaces-core'
import { allRoutines } from '../../../../logic/routines'

import ViewRoutine from './view'
import Banners from '../../../../components/Global/banners'
import RegularModal from '../../../../components/Global/RegularModal'
import Create from './create'

import style from '../../../../all.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const RoutineCard = ({ element, opened, setOpened }) => {
  const context = useEthosContext()

  const web3Data = useWeb3()

  const { chainId, account } = web3Data

  const [edit, setEdit] = useState()

  if (opened) {
    return <></>
  }

  return (
    <>
      {edit && (
        <RegularModal close={() => setEdit()}>
          <Create address={element.address} />
        </RegularModal>
      )}
      <div className={style.RoutineContent}>
        <div className={style.RoutineContentTitle}>
          <h6>{element.entry.name}</h6>
          {element.host === account && (
            <a className={style.RegularButtonDuo} onClick={() => setEdit(true)}>
              Edit
            </a>
          )}
          <a
            onClick={() => setOpened(element)}
            className={style.RegularButtonDuo}>
            Open
          </a>
        </div>
        <div className={style.RoutineContentInfo}>
          <p>
            <a
              className={style.ExtLinkButton}
              href={`${getNetworkElement(
                { context, chainId },
                'etherscanURL'
              )}address/${element.address}`}
              target="_blank">
              Contract
            </a>
            <a
              className={style.ExtLinkButton}
              href={`${getNetworkElement(
                { context, chainId },
                'etherscanURL'
              )}address/${element.host}`}
              target="_blank">
              Host
            </a>
            <a
              className={style.ExtLinkButton}
              href={`${getNetworkElement(
                { context, chainId },
                'etherscanURL'
              )}address/${element.extensionAddress}`}
              target="_blank">
              Extension
            </a>
          </p>
          {element.entry.callerRewardPercentage !== '0' && (
            <p>
              Executor Reward:{' '}
              {formatMoney(
                parseFloat(
                  fromDecimals(element.entry.callerRewardPercentage, 18, true)
                ) * 100
              )}
              %
            </p>
          )}
        </div>
      </div>
    </>
  )
}

const Routines = ({ selectedSubvoice }) => {
  const mode = useMemo(
    () => (selectedSubvoice ? selectedSubvoice.toLowerCase() : 'explore'),
    [selectedSubvoice]
  )

  const [opened, setOpened] = useState()

  useEffect(setOpened, [mode])

  const context = useEthosContext()

  const web3Data = useWeb3()

  const { account } = web3Data

  const filter = useCallback(
    (element) => {
      if (
        mode === 'hosted' &&
        web3Utils.toChecksumAddress(element.host) !==
          web3Utils.toChecksumAddress(account)
      ) {
        return false
      }
      return true
    },
    [mode, account]
  )

  return (
    <>
      <ScrollToTopOnMount />

      {/*<Banners bannerA="banner1" bannerB="banner5" sizeA="35%" sizeB="41%" titleA="Earn by Executing Routines" titleB="Create Routines" linkA="https://docs.ethos.wiki/ethereansos-docs/covenants/covenants-documentation/routines/how-routines-works" linkB="https://docs.ethos.wiki/ethereansos-docs/covenants/covenants-documentation/routines" textA="Routines are purely on-chain, periodic and semi-automatic token transfer / swap operations. You can earn rewards for executing them." textB="Routines can be used for payment cycles, token inflation, investment acquisition and liquidation, and more. No coding skills required."/>*/}
      <div className={style.CovenantsMainBox}>
        <Web3DependantList
          provider={() => allRoutines({ context, ...web3Data })}
          Renderer={RoutineCard}
          filter={filter}
          renderedProperties={{ opened, setOpened }}
        />
        {opened && (
          <ViewRoutine loadedElement={opened} onBack={() => setOpened()} />
        )}
      </div>
    </>
  )
}

Routines.menuVoice = {
  label: 'Routines',
  path: '/covenants/routines',
  index: 1,
  contextualRequire: () => require.context('./', false, /.js$/),
  subMenuvoices: ['Explore', 'Hosted'],
}

export default Routines
