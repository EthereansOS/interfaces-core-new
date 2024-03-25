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
} from 'interfaces-core'
import {
  getOrganizationMetadata,
  getOrganization,
  retrieveAllProposals,
} from 'logic/organization'
import { getDelegation, refreshWrappedToken } from 'logic/delegation'

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
  const { newContract } = web3Data

  const [element, setElement] = useState()
  const [treasuryBalance, setTreasuryBalance] = useState(null)
  const [organization, setOrganization] = useState(null)

  const [delegation, setDelegation] = useState(null)
  const [supportersStake, setSupportersStake] = useState(null)
  const [symbol, setSymbol] = useState(null)

  const { block, chainId, web3, account, getGlobalContract } = useWeb3()

  useEffect(() => {
    setTimeout(async () => {
      getOrganizationMetadata(
        { context },
        {
          contract: newContract(context.SubDAOABI, address),
          address,
          type: type || 'organizations',
        },
        true
      ).then(setElement)
    })
  }, [])

  useEffect(async () => {
    if (!element) return
    setOrganization(null)
    var organizationAddress = element.address
    try {
      var organization = await getOrganization(
        { ...web3Data, context },
        web3Utils.toChecksumAddress(organizationAddress)
      )
      setOrganization(organization)
    } catch (e) {}
  }, [element])

  useEffect(async () => {
    if (!element) return
    setDelegation(null)
    var delegationAddress = element.address
    try {
      var delegation = await getDelegation(
        { ...web3Data, context },
        web3Utils.toChecksumAddress(delegationAddress)
      )
      if (delegation?.type == 'delegation') {
        setDelegation(delegation)
        let del = await retrieveAllProposals(
          { context, web3, account, chainId, getGlobalContract, newContract },
          delegation
        )
        if (del) {
          var firstEl = del[0]
          firstEl.delegationsManager = (
            await refreshWrappedToken({ context, ...web3Data }, firstEl)
          ).delegationsManager
          firstEl.delegationsManager?.wrappedToken &&
            setSupportersStake(
              await blockchainCall(
                firstEl.delegationsManager.wrappedToken.mainInterface.methods
                  .totalSupply,
                firstEl.delegationsManager.wrappedToken.id
              )
            )
          setSymbol(firstEl.delegationsManager?.supportedToken?.symbol)
        }
      }
    } catch (e) {}
  }, [element])

  useEffect(() => {
    if (!organization) return
    setTimeout(async () => {
      var val = await web3.eth.getBalance(
        organization.components.treasuryManager.address
      )
      val = parseFloat(fromDecimals(val, 18, true))
      var ethereumPrice = formatNumber(await getEthereumPrice({ context }))
      val = ethereumPrice * val
      val = '$ ' + formatMoney(val, 2)
      setTreasuryBalance(val)
    })
  }, [organization])

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
              {type === 'delegations' ? (
                <>
                  <p className={style.ItemTitleTopZoneLabel}>
                    Supporters stake
                  </p>
                  <p className={style.ItemTitleTopZoneValue}>
                    {supportersStake && symbol ? (
                      <>
                        {formatMoney(
                          fromDecimals(supportersStake, 18, true),
                          4
                        )}{' '}
                        {symbol}
                      </>
                    ) : (
                      <>loading...</>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className={style.ItemTitleTopZoneLabel}>
                    Treasury Balance
                  </p>
                  <p className={style.ItemTitleTopZoneValue}>
                    {treasuryBalance ?? 'loading...'}
                  </p>
                </>
              )}
            </div>
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
