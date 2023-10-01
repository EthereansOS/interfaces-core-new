import React from 'react'
import T from 'prop-types'
import classNames from 'classnames'

import style from './modal.module.scss'

const Modal = ({ visible, children, centered = false, className }) => {
  if (!visible) {
    return null
  }

  if (centered) {
    return (
      <div className={classNames(style.root, style.centeredContainer)}>
        <div className={classNames(style.centered, className)}>{children}</div>
      </div>
    )
  }

  return (
    <div className={classNames(style.root, style.fullWindow, className)}>
      {children}
    </div>
  )
}

export default Modal

Modal.propTypes = {
  visible: T.bool,
  children: T.node,
  className: T.string,
  centered: T.bool,
}
