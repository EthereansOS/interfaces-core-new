import React from 'react'

import { Link } from 'react-router-dom'
import style from '../../../../all.module.css'

const Create = ({}) => {
    return (<>
        <div className={style.CreatePage}>
            <div className={style.CreateBoxDesc}>
                <h6>Routine</h6>
                <p className={style.CreateBoxDescriptionMinHeight}>Automate periodic token transfers and swaps.</p>
                    <Link className={style.footerNextButton} style={{'padding': '5px 15px 6px 15px'}} to="/covenants/create/routine/">Start</Link>
                    <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations" className={style.ExtLinkButtonAlpha}>Learn</a>
                </div>
                <div className={style.CreateBoxDesc}>
                <h6>Farming</h6>
                <p className={style.CreateBoxDescriptionMinHeight}>Incentivize liquidity with farming contracts that can disperse any ERC-20 token or ETH to liquidity providers.</p>
                <Link className={style.footerNextButton} style={{'padding': '5px 15px 6px 15px'}} to="/covenants/create/farming/">Start</Link>
                <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations" className={style.ExtLinkButtonAlpha}>Learn</a>
            </div>
        </div>
    </>)
}

Create.menuVoice = {
    label : 'Create',
    path : '/covenants/create',
    index : 3,
    contextualRequire : () => require.context('./', false, /.js$/)
}

export default Create