import React, { useState } from 'react'

import { Link } from 'react-router-dom'
import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import { useEffect } from 'react'
import OurCircularProgress from 'components/Global/OurCircularProgress'
import {
  useEthosContext,
  useWeb3,
  shortenWord,
  formatNumber,
  getEthereumPrice,
  formatMoney,
  sendAsync
} from 'interfaces-core'
import {
  getOrganizationMetadata
} from 'logic/organization'
import { getRawField } from 'logic/generalReader'

const ExploreOrganizations = ({ elements, type }) => {
  return (
    <div className={style.ItemAllSingle}>
      {elements.map((address) => (
        <ExploreOrganization key={address} address={address} type={type} />
      ))}
    </div>
  )
}

const ExploreOrganization = ({ address, type }) => {
  const web3Data = useWeb3()
  const context = useEthosContext()
  const { web3, newContract } = web3Data

  const [element, setElement] = useState()
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      getOrganizationMetadata(
        { context },
        {
          contract: newContract(context.SubDAOABI, address),
          address,
          type: type || 'organizations',
        },
        true
      ).then(setElement)
      if(type && type !== 'organizations') {
        return
      }
      if(!type || type === 'organizations') {
        getRawField(web3.currentProvider, address, 'get(bytes32)', context.grimoire.COMPONENT_KEY_TREASURY_MANAGER).then(async addr => {
          addr = abi.decode(["address"], addr)[0]
          var val = await sendAsync(web3, 'eth_getBalance', 
            addr, 'latest'
          )
          val = parseFloat(fromDecimals(val, 18, true))
          var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
          val = ethereumPrice * val
          val = '$ ' + formatMoney(val, 2)
          setTreasuryBalance(val)
        })
      }
    })
  }, [])

  return (
    <div className={style.ItemSingle}>
      <Link to={`/organizations/${type ? type + '/' : ''}${address}`}>
        {element ? (
          <>
            <button className={style.ItemTitleTopZoneLikeButton}>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"></path>
              </svg>
            </button>
            {(!type || type === 'organizations') && <>
              <svg
                className={style.ItemTitleTopZone}
                viewBox="0 0 196 55"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M196 55V0H0.5V1H4.05286C12.4067 1 20.1595 5.34387 24.5214 12.4685L43.5393 43.5315C47.9012 50.6561 55.654 55 64.0078 55H196Z"
                  fill="currentColor"></path>
              </svg>
              <div className={style.ItemInfoSide}>
                <p className={style.ItemTitleTopZoneLabel}>
                  Treasury Balance
                </p>
                <p className={style.ItemTitleTopZoneValue}>
                  {treasuryBalance ?? 'loading...'}
                </p>
              </div>
            </>}
            <LogoRenderer input={element} />
            <div className={style.ItemTitle}>
              <h6>{shortenWord({ context, charsAmount: 15 }, element.name)}</h6>
              {type === 'delegations' ? (
                <h4>Delegation</h4>
              ) : (
                <h4>Organization</h4>
              )}
            </div>
            <svg
              className={style.ItemTitleBottomZone}
              width="281"
              viewBox="0 0 281 99"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 0V99H258.059C248.54 99 239.92 93.3743 236.089 84.6606L205.167 14.3394C201.335 5.62568 192.716 0 183.197 0H0Z"
                fill="currentColor"></path>
            </svg>
          </>
        ) : (
          <OurCircularProgress />
        )}
      </Link>
    </div>
  )
}

export default ExploreOrganizations
