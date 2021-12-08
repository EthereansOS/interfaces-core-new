import React, {useState, useEffect} from 'react'

import { useWeb3 } from '@ethereansos/interfaces-core'
import { CircularProgress } from "@ethereansos/interfaces-ui"

export default ({discriminant, Renderer, emptyMessage, provider, searchText, renderedProperties, rendererIsContainer, allowEmpty}) => {

  const { chainId } = useWeb3()

  const [elements, setElements] = useState(null)

  const [error, setError] = useState("")

  useEffect(() => {
    refreshElements(true)
  }, [chainId, discriminant])

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
        console.log(e)
        setError('Error while loading: ' + (e.message || e))
      }
    })
  }

  var outputElements = elements

  searchText && outputElements && (outputElements = outputElements.filter(element => element.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || element.address?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || element.symbol?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1))

  var message =
  error
    ? <h2>{error}</h2>
    : emptyMessage !== undefined && emptyMessage !== null
      ? typeof emptyMessage === 'string'
        ? <h2>{emptyMessage}</h2>
        : emptyMessage
      : <h2>No elements to display</h2>

  return (!error && !outputElements)
    ? <CircularProgress/>
    : error || (outputElements && outputElements.length === 0 && !allowEmpty)
      ? message
      : outputElements && rendererIsContainer ? <Renderer elements={outputElements} {...{refreshElements, ...renderedProperties}}/> : outputElements.map((element, i) => <Renderer {...{refreshElements, ...renderedProperties}} key={(i + "_" + (element.key || element.id || element.index || element.hash))} element={element}/>)
}