import React, {useState, useEffect} from 'react'

import OurCircularProgress from '../OurCircularProgress'
import RegularModal from '../RegularModal'

import { useWeb3, useEthosContext } from '@ethereansos/interfaces-core'
import { getAMMs } from '../../../logic/amm'
import LogoRenderer from '../LogoRenderer'

import style from '../../../all.module.css'

const ActionInfoSection = ({hideAmmStuff, settings, onSettingsToggle, amm, onAMM, ammRecap, onAMMs}) => {

    const context = useEthosContext()

    const { chainId, newContract } = useWeb3()

    const [amms, setAMMS] = useState(null)
    const [selectAMM, setSelectAMM] = useState(false)

    useEffect(() => {
        setAMMS(null)
        if(hideAmmStuff) {
            return
        }
        getAMMs({context, chainId, newContract}).then(retrievedAMMS => void(setAMMS(retrievedAMMS), onAMM(retrievedAMMS.filter(it => it.name === 'UniswapV3')[0])))
    }, [chainId, hideAmmStuff])

    useEffect(() => amms && onAMMs && onAMMs(amms), [amms])

    return (
        <>
            {selectAMM && <RegularModal close={() => setSelectAMM(false)}>
                <div className={style.AMMSelector}>
                        {amms.map(amm => <label key={amm.address}>
                            <a onClick={() => void(onAMM(amm), setSelectAMM(false))}>
                                <LogoRenderer input={amm}/>
                                <span>{amm.name}</span>
                            </a>
                        </label>)}
                </div>
            </RegularModal>}
            <div className={style.ActionInfoSection}>
                {!hideAmmStuff && (ammRecap || '')}
                {!hideAmmStuff && <>
                    {!amms && <OurCircularProgress/>}
                    {amms && amm && <a className={style.ActionInfoSectionAMM} onClick={() => setSelectAMM(!selectAMM)}>
                        <LogoRenderer input={amm} title={amm?.name}/>
                        <span>▼</span>
                    </a>}
                </>}
                <a className={style.ActionInfoSectionSettings} onClick={() => onSettingsToggle(!settings)}>
                    <figure>
                        <img src={`${process.env.PUBLIC_URL}/img/settings.svg`}></img>
                    </figure>
                </a>
            </div>
        </>
    )
}

    export default ActionInfoSection