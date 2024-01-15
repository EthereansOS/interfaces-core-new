import React, { useState } from 'react'
import classnames from 'classnames'
import Header from '../Header'
import { Container } from 'interfaces-ui'
import style from './main-template.module.css'
import Content from '../Content'

import { useWeb3, useEthosContext, getNetworkElement } from 'interfaces-core'

const MainTemplate = ({ Component, ...props }) => {
  const [, setState] = useState({})

  const context = useEthosContext()

  const { block, chainId } = useWeb3()

  return props.componentOnly ? <Component setTemplateState={setState} {...props} /> : (
    <>
      <main
        className={style.root}>
        <div className={style.BlockNews}>
          <p>&#10212; <a href={getNetworkElement({context, chainId}, 'etherscanURL') + '/block/' + block} target="_blank">#{block}</a></p>
        </div>
        <Header {...props} />
        <Container className={classnames(style.container)}>
          <Content>
            <Component setTemplateState={setState} {...props} />
          </Content>
        </Container>
      </main>
      <div className={style.OnlyMobile}>
        <p>This interface is not mobile ready at the moment.</p>
      </div>
    </>
  )
}

export default MainTemplate
