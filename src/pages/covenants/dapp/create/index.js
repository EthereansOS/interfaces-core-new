import React from 'react'

import { Link } from 'react-router-dom'
import style from '../../../../all.module.css'

const Create = ({}) => {
    return (<>
        <div className={style.CreatePage}>
            <div className={style.CreateBoxDesc}>
                <h6>Routine</h6>
                <p>Create a purely on-chain, periodic and semi-automatic token transfer / swap operation.</p>
                    <Link className={style.NextStep} to="/covenants/create/routine/">Start</Link>
                    <a target="_blank" href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations" className={style.ExtLinkButtonAlpha}>Learn</a>
                </div>
                <div className={style.CreateBoxDesc}>
                <h6>Farming</h6>
                <p>Create a multi-DEX farming solution with multiple LP setups.</p>
                <Link className={style.NextStep} to="/covenants/create/farming/">Start</Link>
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