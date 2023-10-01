import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { useWeb3 } from 'interfaces-core'
import { FixedSizeList } from 'react-window'
import OurCircularProgress from '../OurCircularProgress'

export default ({ discriminant, Renderer, emptyMessage, provider, searchText, renderedProperties, rendererIsContainer, allowEmpty, fixedList, sortOrder, filter }) => {

  const { chainId } = useWeb3()

  const [elements, setElements] = useState(null)

  const [error, setError] = useState("")

  useEffect(() => {
    refreshElements(true)
  }, [chainId, discriminant])

  const refreshElements = useCallback(async withLoader => {
    withLoader === true && setElements(null)
    setError("")
    setTimeout(async () => {
      while(true) {
        try {
          var els = provider()
          els = els.then ? await els : els
          els = els instanceof Array ? els : [els]
          return setElements(els)
        } catch(e) {
          console.log(e)
          var message = (e.stack || e.message || e).toLowerCase()
          if(message.indexOf('header not found') === -1 && message.indexOf('response has no error') === -1) {
            return setError('Error while loading: ' + (e.message || e))
          }
          await new Promise(ok => setTimeout(ok, 3000))
        }
      }
    })
  }, [provider])

  var outputElements = elements

  searchText && outputElements && (outputElements = outputElements.filter(element => element.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || element.address?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || element.symbol?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1))

  filter && outputElements && (outputElements = outputElements.filter(filter))

  sortOrder && outputElements && (outputElements = outputElements.sort(sortOrder))

  var message =
  error
    ? <h2>{error}</h2>
    : emptyMessage !== undefined && emptyMessage !== null
      ? typeof emptyMessage === 'string'
        ? <h2>{emptyMessage}</h2>
        : emptyMessage
      : <h2>No elements to display</h2>

  const Row = useCallback(({data, index, style}) => <div style={style}>
    <Renderer {...{refreshElements, ...renderedProperties}} element={data[index]} />
  </div>, [Renderer, refreshElements, renderedProperties])

  return (!error && !outputElements)
    ? <OurCircularProgress/>
    : error || (outputElements && outputElements.length === 0 && !allowEmpty)
      ? message
      : outputElements && rendererIsContainer ? <Renderer elements={outputElements} {...{refreshElements, ...renderedProperties}}/> : fixedList ? <FixedSizeList
        itemKey={(i, itemData) => (i + "_" + (itemData[i].key || itemData[i].id || itemData[i].index || itemData[i].hash || itemData[i].address))}
        itemData={outputElements}
        itemCount={outputElements.length}
        width="100%"
        height={674}
        itemSize={100}
      >
        {Row}
      </FixedSizeList> : outputElements.map((element, i) => <Renderer {...{refreshElements, ...renderedProperties}} key={(i + "_" + (element.key || element.id || element.index || element.hash || element.address))} element={element}/>)
}