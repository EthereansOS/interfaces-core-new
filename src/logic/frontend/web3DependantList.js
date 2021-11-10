import React, {useState, useEffect} from 'react'

import { useWeb3 } from '@ethereansos/interfaces-core'
import { CircularProgress } from "@ethereansos/interfaces-ui"

export default ({Renderer, emptyMessage, provider}) => {

  const { web3 } = useWeb3()

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
  }, [web3])

  return (!error && !elements)
    ? <CircularProgress/>
    : error || (elements && elements.length === 0)
      ? <h2>{error || emptyMessage || "No elements to display"}</h2>
      : elements && elements.map((element, i) => <Renderer key={(i + "_" + element)} element={element}/>)
}