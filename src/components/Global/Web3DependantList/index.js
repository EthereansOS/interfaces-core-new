import React, {useState, useEffect} from 'react'

import { useWeb3 } from '@ethereansos/interfaces-core'
import { CircularProgress } from "@ethereansos/interfaces-ui"

export default ({Renderer, emptyMessage, provider, searchText, onSelection}) => {

  const { chainId } = useWeb3()

  const [elements, setElements] = useState(null)

  const [error, setError] = useState("")

  useEffect(() => {
    setElements(null)
    setError("")
    setTimeout(async () => {
      try {
        var els = provider()
        setElements(els.then ? await els : els)
      } catch(e) {
        console.error(e)
        setError('Error while loading: ' + (e.message || e))
      }
    })
  }, [chainId])

  var outputElements = elements

  searchText && outputElements && (outputElements = outputElements.filter(element => element.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || element.address?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1))

  return (!error && !outputElements)
    ? <CircularProgress/>
    : error || (outputElements && outputElements.length === 0)
      ? <h2>{error || (emptyMessage !== undefined && emptyMessage !== null ? emptyMessage : "No elements to display")}</h2>
      : outputElements && outputElements.map((element, i) => <Renderer key={(i + "_" + element)} element={element} onClick={() => onSelection && onSelection(element)}/>)
}