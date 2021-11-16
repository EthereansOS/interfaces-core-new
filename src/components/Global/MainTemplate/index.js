import React, { useState } from 'react'
import classnames from 'classnames'
import Header from '../Header'
import { Container } from '@ethereansos/interfaces-ui'
import style from './main-template.module.css'
import Content from '../Content'

const MainTemplate = ({ Component, ...props }) => {
  const [, setState] = useState({})

  return props.componentOnly ? <Component setTemplateState={setState} {...props} /> : (
    <main
      className={style.root}>
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
