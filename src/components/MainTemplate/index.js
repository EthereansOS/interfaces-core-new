import React, { useState } from 'react'
import classnames from 'classnames'
import Header from '../Header'
import Navigation from '../../components/Navigation'
import { Container } from '@ethereansos/interfaces-ui'
import style from './main-template.module.css'
import Content from '../Content'

const MainTemplate = ({ Component, ...props }) => {
  const [, setState] = useState({})
  const backgroundUrl = `${process.env.PUBLIC_URL}/assets/images/city.png`

  return (
    <main
      style={{ backgroundImage: `url(${backgroundUrl})` }}
      className={style.root}>
      <Header {...props} />
      <Container className={classnames(style.container)}>
        <Navigation menuName={props.menuName} isDapp={props.isDapp} />
        <Content>
          <Component setTemplateState={setState} {...props} />
        </Content>
      </Container>
    </main>
  )
}

export default MainTemplate
