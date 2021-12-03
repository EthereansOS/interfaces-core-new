import React, {useState, useEffect} from 'react'

import { useWeb3 } from '@ethereansos/interfaces-core'
import { CircularProgress } from "@ethereansos/interfaces-ui"

export default ({Renderer, emptyMessage, provider, searchText, renderedProperties, rendererIsContainer, allowEmpty}) => {

  const { chainId } = useWeb3()

  const [elements, setElements] = useState(null)

  const [error, setError] = useState("")

  useEffect(() => {
    refreshElements(true)
  }, [chainId])

  async function refreshElements(withLoader) {
    withLoader === true && setElements(null)
    setError("")
    setTimeout(async () => {
      try {
        var els = provider()
        els = els.then ? await els : els
        els = els instanceof Array ? els : [els]
        setElements(els)
      } catch(e) {
        console.error(e)
        setError('Error while loading: ' + (e.message || e))
      }
    })
  }

  var outputElements = elements

  searchText && outputElements && (outputElements = outputElements.filter(element => element.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || element.address?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || element.symbol?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1))

  return (!error && !outputElements)
    ? <CircularProgress/>
    : error || (outputElements && outputElements.length === 0 && !allowEmpty)
      ? <h2>{error || (emptyMessage !== undefined && emptyMessage !== null ? emptyMessage : "No elements to display")}</h2>
      : outputElements && rendererIsContainer ? <Renderer elements={outputElements} {...{...renderedProperties, refreshElements}}/> : outputElements.map((element, i) => <Renderer {...{...renderedProperties, refreshElements}} key={(i + "_" + (element.key || element.id || element.index))} element={element}/>)
}