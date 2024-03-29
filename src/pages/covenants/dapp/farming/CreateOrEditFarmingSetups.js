import React, { useState } from 'react'

import { formatMoney, fromDecimals, useEthosContext } from 'interfaces-core'

import CreateOrEditFarmingSetup from './CreateOrEditFarmingSetup'

import style from '../../../../all.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

export default (props) => {
  const {
    rewardToken,
    farmingSetups,
    onAddFarmingSetup,
    onEditFarmingSetup,
    onRemoveFarmingSetup,
    onCancel,
    onFinish,
    generation,
    finishButton,
  } = props

  const context = useEthosContext()

  const [editSetup, setEditSetup] = useState()
  const [gen2SetupType, setGen2SetupType] = useState()

  if (
    generation === 'gen2' &&
    !gen2SetupType &&
    (farmingSetups.length === 0 || editSetup === null)
  ) {
    return (
      <div className={style.generationBoh}>
        <ScrollToTopOnMount />

        <div className={style.CreateBoxDesc}>
          <h6>Diluted Liquidity</h6>
          <p className={style.BreefRecapC}>
            By selecting Diluted Liquidity, your setup will be automatically
            customized with a price curve the moment it is activated. The range
            of the curve will have a max of (10,000 x current price of the
            token) and a minimum of (current price of the token / 10,000).
            Diluted liquidity mitigates the risk of impermanent loss.
          </p>
          <a
            className={style.RegularButtonDuo}
            onClick={() =>
              void (setGen2SetupType('diluted'), setEditSetup(null))
            }>
            Select
          </a>
        </div>
        <div className={style.CreateBoxDesc}>
          <h6>Concentrated Liquidity</h6>
          <p className={style.BreefRecapC}>
            By selecting Concentrated Liquidity, you will need to manually
            customize the setup’s price curve. To learn more about price curves
            and the risk of impermanent loss, read the Uniswap Documentation:{' '}
            <a
              target="_blank"
              href="https://docs.uniswap.org/concepts/V3-overview/concentrated-liquidity">
              Uniswap Documentation
            </a>
          </p>
          <a
            className={style.RegularButtonDuo}
            onClick={() =>
              void (setGen2SetupType('concentrated'), setEditSetup(null))
            }>
            Select
          </a>
        </div>
        <div className={style.WizardFooter}>
          <button
            className={style.WizardFooterBack}
            onClick={() =>
              farmingSetups.filter((it) => it.editing).length === 0
                ? onCancel()
                : setEditSetup()
            }>
            Back
          </button>
        </div>
      </div>
    )
  }

  if (
    editSetup !== undefined ||
    (generation === 'gen1' && farmingSetups.length === 0) ||
    (generation === 'gen2' && gen2SetupType)
  ) {
    return (
      <>
        <ScrollToTopOnMount />
        <CreateOrEditFarmingSetup
          rewardToken={rewardToken}
          generation={generation}
          gen2SetupType={
            generation === 'gen1'
              ? 'diluted'
              : gen2SetupType || editSetup?.gen2SetupType
          }
          editSetup={editSetup}
          onAddFarmingSetup={(setup) =>
            void (onAddFarmingSetup(setup), setEditSetup(), setGen2SetupType())
          }
          onEditFarmingSetup={(setup, index) =>
            void (onEditFarmingSetup(setup, index),
            setEditSetup(),
            setGen2SetupType())
          }
          onCancel={() => void (setEditSetup(), setGen2SetupType())}
        />
      </>
    )
  }

  return (
    <div>
      <ScrollToTopOnMount />
      {farmingSetups.map((setup, index) => (
        <div key={index} className={style.generationSelectorULTRA}>
          <div className={style.SetupINFORECAP}>
            <span className={style.RecapInfo}>
              <b>Pair:</b>
              <br />
              {!setup.free
                ? `${
                    setup.mainToken.isEth && setup.involvingETH
                      ? 'ETH'
                      : setup.liquidityPoolToken.symbol
                  }`
                : ` ${setup.liquidityPoolToken.tokens.map(
                    (token) =>
                      `${
                        setup.involvingETH &&
                        token.address.toLowerCase() ===
                          setup.ethereumAddress.toLowerCase()
                          ? 'ETH'
                          : token.symbol
                      }`
                  )}`}
            </span>
            <span className={style.RecapInfo}>
              <b>AMM:</b>
              <br />
              {setup.liquidityPoolToken.name}
            </span>
            <span className={style.RecapInfo}>
              <b>Start Block:</b>
              <br />
              {setup.startBlock !== '0' ? setup.startBlock : '-'}
            </span>
            <br />
            <span className={style.RecapInfo}>
              <b>Reward/Block:</b>
              <br />
              {formatMoney(
                fromDecimals(setup.rewardPerBlock, rewardToken.decimals, true),
                8
              )}{' '}
              {rewardToken.symbol}
            </span>
            <span className={style.RecapInfo}>
              <b>Total Reward:</b>
              <br />
              {formatMoney(
                fromDecimals(
                  parseInt(setup.rewardPerBlock) *
                    parseInt(setup.blockDuration),
                  rewardToken.decimals,
                  true
                ),
                8
              )}{' '}
              {rewardToken.symbol}
            </span>
            <span className={style.RecapInfo}>
              <b>Duration:</b>
              <br />
              {
                Object.entries(context.blockIntervals).filter(
                  (it) => parseInt(it[1]) === parseInt(setup.blockDuration)
                )[0][0]
              }
            </span>
            {setup.renewTimes !== 0 &&
              setup.renewTimes &&
              parseInt(setup.renewTimes) > 0 && (
                <>
                  <br />
                  <span className={style.RecapInfo}>
                    <b>Renew Times:</b>
                    <br />
                    {setup.renewTimes}
                  </span>
                </>
              )}
          </div>
          <div className={style.SetupActions}>
            {(!setup.editing || setup.lastSetup?.active) && (
              <a
                className={style.RegularButtonDuo}
                onClick={() => onRemoveFarmingSetup(index)}>
                {setup.editing
                  ? setup.disable
                    ? 'Cancel Disable'
                    : 'Disable'
                  : 'Delete'}
              </a>
            )}
            {(!setup.editing ||
              setup.lastSetup?.active ||
              parseInt(setup.initialRenewTimes) > 0) && (
              <a
                className={style.RegularButtonDuo}
                onClick={() => void setEditSetup({ ...setup, index })}>
                Edit
              </a>
            )}
          </div>
        </div>
      ))}
      <div className={style.WizardFooter}>
        <a className={style.RoundedButton} onClick={() => setEditSetup(null)}>
          +
        </a>
        <div className={style.ActionBTNCreateX}>
          {!finishButton && (
            <button
              className={style.WizardFooterBack}
              onClick={() => {
                farmingSetups.forEach((_, index) => onRemoveFarmingSetup(index))
                onCancel()
              }}>
              Back
            </button>
          )}
          {finishButton || (
            <button className={style.WizardFooterNext} onClick={onFinish}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
