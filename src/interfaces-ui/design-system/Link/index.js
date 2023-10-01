import React from 'react'
import T from 'prop-types'
import classNames from 'classnames'

import style from './link.module.scss'

const Link = ({ children, className, external, href, to, RLink, ...props }) => {
  const additionalProps =
    external && href ? { target: '_blank', rel: 'noreferrer' } : {}

  if (to) {
    return (
      <RLink to={to} {...props} className={classNames(style.root, className)}>
        {children}
      </RLink>
    )
  }

  return (
    <a
      href={href}
      {...props}
      {...additionalProps}
      className={classNames(style.root, className)}>
      {children}
    </a>
  )
}

export default Link

Link.propTypes = {
  className: T.string,
  children: T.oneOfType([T.arrayOf(T.node), T.node]),
  href: T.string,
  external: T.bool,
  to: T.string,
  RLink: T.node,
}
