import React from 'react'

import style from '../../../../all.module.css'
import { Link } from 'react-router-dom'

import { useWeb3 } from 'interfaces-core'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'

const Create = () => {
  const web3Data = useWeb3()

  const { dualChainId } = web3Data

  return (
    <div>
      <ScrollToTopOnMount />

      <div className={style.CreateBoxDesc}>
        <h6>Organization</h6>
        <p>
          Start a completely on-chain governance organization with deeply
          composable permission levels.
        </p>
        <Link
          className={style.NextStep}
          to="/organizations/create/organization">
          Start
        </Link>
        <a
          target="_blank"
          href="https://docs.ethos.wiki/ethereansos-docs/organizations/organizations"
          className={style.ExtLinkButtonAlpha}>
          Learn
        </a>
      </div>
      {
        <div className={style.CreateBoxDesc}>
          <h6>Delegation</h6>
          <p>
            Create a Delegation, an independent political party that can compete
            for grant funding from one or more Organizations.
          </p>
          <Link
            className={style.NextStep}
            to="/organizations/create/delegation">
            Start
          </Link>
          <a
            target="_blank"
            className={style.ExtLinkButtonAlpha}
            href="https://docs.ethos.wiki/ethereansos-docs/organizations/delegations">
            Learn
          </a>
        </div>
      }
    </div>
  )
}

Create.menuVoice = {
  label: 'Create',
  path: '/organizations/create',
  contextualRequire: () => require.context('./', false, /.js$/),
}

export default Create
