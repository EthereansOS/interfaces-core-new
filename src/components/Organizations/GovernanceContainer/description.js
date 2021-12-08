import React, { useState } from 'react'
import RegularModal from '../../Global/RegularModal'
import style from '../../../all.module.css'

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
              var all = [...ref.querySelectorAll('a')].forEach(it => it.target = "_blank")
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
          var all = [...ref.querySelectorAll('a')].forEach(it => it.target = "_blank")
          if(!modal && html.length > sl) {
            ref.innerHTML += `<a>${short || modal ? "More" : "Less"}</a>`
            ref.children[ref.children.length - 1].onclick = toggleMore
          }
        }}/>
      </>
    )
  }

export default Description