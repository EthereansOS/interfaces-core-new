import React, { useState } from 'react'
import RegularModal from '../../Global/RegularModal'
import style from '../../../all.module.css'

const normalizeAnchors = async function(a) {
  a.target = '_blank'
  var href = a.href
  href = href.split('.eth')
  var lastIndex = href.length -1
  var lastElement = href[lastIndex]
  if(lastElement.indexOf('.') !== 0) {
    lastElement = '.limo' + lastElement
  }
  href[lastIndex] = lastElement
  a.href = href.join('.eth')
}

var Description = ({title, description, className, shortLength, modal}) => {

    const [short, setShort] = useState(true)

    if(!description) {
      return <></>
    }

    var sl = shortLength || 250

    window.marked.setOptions({breaks : true})

    function toggleMore(e) {
      e.preventDefault && e.preventDefault()
      e.stopPropagation && e.stopPropagation()
      e.stopImmediatePropagation && e.stopImmediatePropagation()
      setShort(modal ? false : !short)
      return false
    }

    return (
      <>
        {!short && modal && <RegularModal close={() => setShort(!short)}>
          <div className={style.DescriptionBigGui}>
            {title && <h6>{title}</h6>}
            <p className={className} ref={ref => {
              if(!ref) {
                return
              }
              ref.innerHTML = window.marked.parse(description)
              var all = [...ref.querySelectorAll('a')].forEach(normalizeAnchors)
            }}/>
          </div>
        </RegularModal>}
        {title && <h6>{title}</h6>}
        <p className={className} ref={ref => {
          if(!ref) {
            return
          }
          modal && (ref.onclick = toggleMore)
          var html = window.marked.parse(description)
          var innerHTML = short || modal ? html.substring(0, sl) : html
          ref.innerHTML = innerHTML
          var all = [...ref.querySelectorAll('a')].forEach(normalizeAnchors)
          if(!modal && html.length > sl) {
            ref.innerHTML += `<a>${short || modal ? "More" : "Less"}</a>`
            ref.children[ref.children.length - 1].onclick = toggleMore
          }
        }}/>
      </>
    )
  }

export default Description