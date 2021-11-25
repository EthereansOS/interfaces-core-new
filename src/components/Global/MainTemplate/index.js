import React, { useState } from 'react'
import classnames from 'classnames'
import Header from '../Header'
import { Container } from '@ethereansos/interfaces-ui'
import style from './main-template.module.css'
import Content from '../Content'

import { useWeb3, useEthosContext, getNetworkElement } from '@ethereansos/interfaces-core'

const MainTemplate = ({ Component, ...props }) => {
  const [, setState] = useState({})

  const context = useEthosContext()

  const {block} = useWeb3()

  return props.componentOnly ? <Component setTemplateState={setState} {...props} /> : (
    <main
      className={style.root}>
      <div>
        Block: <a href={getNetworkElement({context}, 'etherscanURL') + '/block/' + block} target="_blank">#{block}</a>
      </div>
      <Header {...props} />
      <Container className={classnames(style.container)}>
        <Content>
          <Component setTemplateState={setState} {...props} />
        </Content>
      </Container>
    </main>
  )
}

export default MainTemplate
