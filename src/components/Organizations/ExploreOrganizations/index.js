import React, {useState} from 'react'

import { Link } from 'react-router-dom'
import LogoRenderer from '../../Global/LogoRenderer'

import style from '../../../all.module.css'
import { useEffect } from 'react'
import OurCircularProgress from 'components/Global/OurCircularProgress'
import { useEthosContext, useWeb3 } from 'interfaces-core'
import { getOrganizationMetadata } from 'logic/organization'

const ExploreOrganizations = ({elements, type}) => {
  return (
    <div className={style.OrgAllSingle}>
      {elements.map(address => <ExploreOrganization key={address} address={address} type={type}/>)}
    </div>
  )
}

const ExploreOrganization = ({address, type}) => {

  const web3Data = useWeb3()
  const context = useEthosContext()
  const { newContract } = web3Data

  const [element, setElement] = useState()

  useEffect(() => {
    setTimeout(async () => {
      getOrganizationMetadata({ context }, { contract: newContract(context.SubDAOABI, address), address, type: type || 'organizations' }, true).then(setElement)
    })
  }, [])

  return (<Link className={style.OrgSingle} to={`/guilds/${type || 'organizations'}/${address}`}>
    {element ? <>
      <LogoRenderer input={element}/>
      <div className={style.OrgTitleEx}>
        <h6>{element.name}</h6>
      </div>
    </> : <OurCircularProgress/>}
  </Link>)
}

export default ExploreOrganizations
