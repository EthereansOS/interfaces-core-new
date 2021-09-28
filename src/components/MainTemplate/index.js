import React, { useState } from 'react'
import classnames from 'classnames'
import Header from '../Header'
import DappMenu from '../DappMenu'
import { Container } from '@ethereansos/interfaces-ui'
import style from './main-template.module.css'
import Content from '../Content'

const MainTemplate = ({ Component, ...props }) => {
  const [, setState] = useState({})

  return (
    <main
      className={style.root}>
      <Header {...props} />
      <Container className={classnames(style.container)}>
        <DappMenu></DappMenu>
        <Content>
          <Component setTemplateState={setState} {...props} />
        </Content>
      </Container>
    </main>
  )
}

export default MainTemplate
