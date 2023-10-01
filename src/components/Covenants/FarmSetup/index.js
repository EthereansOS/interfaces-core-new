import React from 'react'
import { Link } from 'react-router-dom'


import style from '../../../all.module.css'
import RegularButton from '../../Global/RegularButton/index.js'
import RegularButtonDuo from '../../Global/RegularButtonDuo/index.js'
import RegularButtonDuoSmall from '../../Global/RegularButtonDuoSmall/index.js'
import RegularButtonDuoSmallWhite from '../../Global/RegularButtonDuoSmallWhite/index.js'
import ExtLinkButton from '../../Global/ExtLinkButton/index.js'
import ItemLinkButton from '../../Global/ItemLinkButton/index.js'
import VioletLinkButton from '../../Global/VioletLinkButton/index.js'
import ActionAWeb3ButtonSmall from '../../Global/ActionAWeb3ButtonSmall/index.js'
import PositionOpen from './PositionOpen.js'
import AdLiquidity from './AddLiquidity.js'
import RemoveLiquidity from './RemoveLiquidity.js'

const FarmSetup = (props) => {
  return (
    <>
      {/*Single setup Start*/}
      <div className={style.FarmSetup}>
        <div className={style.FarmMain}>
          <div className={style.FarmInstructions}>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <p className={style.FarmInfoDetail}>
              <span class={style.FarmActivityA}>Active</span>
              <b>APR:</b> 500%
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>Daily Rate:</b> 50000 OS
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>End:</b> <a>31467951397</a>
            </p>
            <p className={style.FarmInfoDetailM}>
              <RegularButtonDuo></RegularButtonDuo>
            </p>
          </div>

          <div className={style.farmInfoCurve}>
            <p className={style.farmInfoCurveL}>
              <p className={style.MAinTokensel}>
                <a>
                  <img src={`${process.env.PUBLIC_URL}/img/switch.png`}></img>
                </a>
                OS per ETH
              </p>
            </p>
            <p className={style.farmInfoCurveR}>
              <p className={style.PriceRangeInfoFarm}>
                <VioletLinkButton></VioletLinkButton>
                <VioletLinkButton></VioletLinkButton>
              </p>

            </p>
            <div className={style.UniV3CurveView}>
              <div className={style.UniV3CurveViewCurv}>
                  <span className={style.CircleLeftV3Curve}></span>
                  <span className={style.CircleLeftV3CurvePrice}> Diluted</span>
                  <span className={style.CircleRightV3Curve}></span>
                  <span className={style.CircleRightV3CurvePrice}> Diluted</span>
                  <div className={style.CircleActualPriceV3} style={{left : `50%`}}>
                      <span className={style.CircleRightV3Actual}>
                          <img src={`${process.env.PUBLIC_URL}/img/arrow.png`}></img>
                          <span className={style.CircleRightV3ActualPrice}> $16</span>
                      </span>
                  </div>
                </div>
              </div>
              <span className={style.UniV3TVLFIV}><b>TVL</b>: 56.436234 OS - 1444 ETH</span>
          </div>
        </div>


      </div>
      {/*Single setup With a position End*/}



      {/*Single setup OPEN Start*/}
      <div className={style.FarmSetup}>
        <div className={style.FarmMain}>
          <div className={style.FarmInstructions}>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <p className={style.FarmInfoDetail}>
              <span class={style.FarmActivityA}>Active</span>
              <b>APR:</b> 500%
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>Daily Rate:</b> 50000 OS
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>End:</b> <a>31467951397</a>
            </p>

          </div>

          <div className={style.farmInfoCurve}>
            <p className={style.farmInfoCurveL}>
              <p className={style.MAinTokensel}>
                <a>
                  <img src={`${process.env.PUBLIC_URL}/img/switch.png`}></img>
                </a>
                OS per ETH
              </p>
            </p>
            <p className={style.farmInfoCurveR}>
              <p className={style.PriceRangeInfoFarm}>
                <VioletLinkButton></VioletLinkButton>
                <VioletLinkButton></VioletLinkButton>
              </p>

            </p>
            <div className={style.UniV3CurveView}>
              <div className={style.UniV3CurveViewCurv}>
                  <span className={style.CircleLeftV3Curve}></span>
                  <span className={style.CircleLeftV3CurvePrice}> Diluted</span>
                  <span className={style.CircleRightV3Curve}></span>
                  <span className={style.CircleRightV3CurvePrice}> Diluted</span>
                  <div className={style.CircleActualPriceV3} style={{left : `50%`}}>
                      <span className={style.CircleRightV3Actual}>
                          <img src={`${process.env.PUBLIC_URL}/img/arrow.png`}></img>
                          <span className={style.CircleRightV3ActualPrice}> $16</span>
                      </span>
                  </div>
                </div>
              </div>
              <span className={style.UniV3TVLFIV}><b>TVL</b>: 56.436234 OS - 1444 ETH</span>
          </div>
          <PositionOpen></PositionOpen>
        </div>
      </div>
      {/*Single setup With a position End*/}

      {/*Single setup Open Start*/}
      <div className={style.FarmSetup}>
        <div className={style.FarmMain}>
          <div className={style.FarmInstructions}>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <p className={style.FarmInfoDetail}>
              <span class={style.FarmActivityA}>Active</span>
              <b>APR:</b> 500%
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>Daily Rate:</b> 50000 OS
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>End:</b> <a>31467951397</a>
            </p>
            <p className={style.FarmInfoDetailM}>
              <RegularButtonDuo></RegularButtonDuo>
            </p>
          </div>

          <div className={style.farmInfoCurve}>
            <p className={style.farmInfoCurveL}>
              <p className={style.MAinTokensel}>
                <a>
                  <img src={`${process.env.PUBLIC_URL}/img/switch.png`}></img>
                </a>
                OS per ETH
              </p>
            </p>
            <p className={style.farmInfoCurveR}>
              <p className={style.PriceRangeInfoFarm}>
                <VioletLinkButton></VioletLinkButton>
                <VioletLinkButton></VioletLinkButton>
              </p>

            </p>
            <div className={style.UniV3CurveView}>
              <div className={style.UniV3CurveViewCurv}>
                  <span className={style.CircleLeftV3Curve}></span>
                  <span className={style.CircleLeftV3CurvePrice}> Diluted</span>
                  <span className={style.CircleRightV3Curve}></span>
                  <span className={style.CircleRightV3CurvePrice}> Diluted</span>
                  <div className={style.CircleActualPriceV3} style={{left : `50%`}}>
                      <span className={style.CircleRightV3Actual}>
                          <img src={`${process.env.PUBLIC_URL}/img/arrow.png`}></img>
                          <span className={style.CircleRightV3ActualPrice}> $16</span>
                      </span>
                  </div>
                </div>
              </div>
              <span className={style.UniV3TVLFIV}><b>TVL</b>: 56.436234 OS - 1444 ETH</span>
          </div>
        </div>
        <AdLiquidity></AdLiquidity>

      </div>
      {/*Single setup Open  End*/}

      {/*Single setup Open Withdraw START*/}
      <div className={style.FarmSetup}>
        <div className={style.FarmMain}>
          <div className={style.FarmInstructions}>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <div className={style.FarmToken}>
              <figure>
                <a target="_blank" href="https://etherscan.io/token/0x6100dd79fCAA88420750DceE3F735d168aBcB771">
                  <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6100dd79fCAA88420750DceE3F735d168aBcB771/logo.png"></img>
                </a>
              </figure>
              <span>50%</span>
            </div>
            <p className={style.FarmInfoDetail}>
              <span class={style.FarmActivityA}>Active</span>
              <b>APR:</b> 500%
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>Daily Rate:</b> 50000 OS
            </p>
            <p className={style.FarmInfoDetailS}>
              <b>End:</b> <a>31467951397</a>
            </p>

          </div>

          <div className={style.farmInfoCurve}>
            <p className={style.farmInfoCurveL}>
              <p className={style.MAinTokensel}>
                <a>
                  <img src={`${process.env.PUBLIC_URL}/img/switch.png`}></img>
                </a>
                OS per ETH
              </p>
            </p>
            <p className={style.farmInfoCurveR}>
              <p className={style.PriceRangeInfoFarm}>
                <VioletLinkButton></VioletLinkButton>
                <VioletLinkButton></VioletLinkButton>
              </p>

            </p>
            <div className={style.UniV3CurveView}>
              <div className={style.UniV3CurveViewCurv}>
                  <span className={style.CircleLeftV3Curve}></span>
                  <span className={style.CircleLeftV3CurvePrice}> Diluted</span>
                  <span className={style.CircleRightV3Curve}></span>
                  <span className={style.CircleRightV3CurvePrice}> Diluted</span>
                  <div className={style.CircleActualPriceV3} style={{left : `50%`}}>
                      <span className={style.CircleRightV3Actual}>
                          <img src={`${process.env.PUBLIC_URL}/img/arrow.png`}></img>
                          <span className={style.CircleRightV3ActualPrice}> $16</span>
                      </span>
                  </div>
                </div>
              </div>
              <span className={style.UniV3TVLFIV}><b>TVL</b>: 56.436234 OS - 1444 ETH</span>
          </div>
          <PositionOpen></PositionOpen>
        </div>
        <RemoveLiquidity></RemoveLiquidity>

      </div>
      {/*Single setup Open Withdraw ENDd*/}
    </>
  )
}

export default FarmSetup
