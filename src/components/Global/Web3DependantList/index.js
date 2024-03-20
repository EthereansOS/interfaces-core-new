import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { useWeb3 } from 'interfaces-core'
import { FixedSizeList } from 'react-window'
import OurCircularProgress from '../OurCircularProgress'
import style from '../../../all.module.css'
export default ({
  discriminant,
  Renderer,
  emptyMessage,
  provider,
  searchText,
  renderedProperties,
  rendererIsContainer,
  allowEmpty,
  fixedList,
  sortOrder,
  filter,
}) => {
  const { chainId } = useWeb3()

  const [elements, setElements] = useState(null)

  const [error, setError] = useState('')

  useEffect(() => {
    refreshElements(true)
  }, [chainId, discriminant])

  const refreshElements = useCallback(
    async (withLoader) => {
      withLoader === true && setElements(null)
      setError('')
      setTimeout(async () => {
        while (true) {
          try {
            var els = provider()
            els = els.then ? await els : els
            els = els instanceof Array ? els : [els]
            return setElements(els)
          } catch (e) {
            console.log(e)
            var message = (e.stack || e.message || e).toLowerCase()
            if (
              message.indexOf('header not found') === -1 &&
              message.indexOf('response has no error') === -1
            ) {
              return setError('Error while loading: ' + (e.message || e))
            }
            await new Promise((ok) => setTimeout(ok, 3000))
          }
        }
      })
    },
    [provider]
  )

  var outputElements = elements

  searchText &&
    outputElements &&
    (outputElements = outputElements.filter(
      (element) =>
        element.name?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
        element.address?.toLowerCase().indexOf(searchText.toLowerCase()) !==
          -1 ||
        element.symbol?.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
    ))

  filter && outputElements && (outputElements = outputElements.filter(filter))

  sortOrder &&
    outputElements &&
    (outputElements = outputElements.sort(sortOrder))

  var message = error ? (
    <h2>{error}</h2>
  ) : emptyMessage !== undefined && emptyMessage !== null ? (
    typeof emptyMessage === 'string' ? (
      <h2>{emptyMessage}</h2>
    ) : (
      emptyMessage
    )
  ) : (
    <div className={style.NoElementsWrapper}>
      <svg width="100px" height="100px" viewBox="0 0 32 32">
        <g id="page_x2C__document_x2C__emoji_x2C__No_results_x2C__empty_page">
          <g id="XMLID_1521_">
            <path
              d="M21.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75    S21.09,14.75,21.5,14.75z"
              fill="#263238"
              id="XMLID_1887_"
            />
            <path
              d="M10.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75    S10.09,14.75,10.5,14.75z"
              fill="#263238"
              id="XMLID_1885_"
            />
          </g>
          <g id="XMLID_1337_">
            <g id="XMLID_4010_">
              <polyline
                fill="none"
                id="XMLID_4073_"
                points="     21.5,1.5 4.5,1.5 4.5,30.5 27.5,30.5 27.5,7.5    "
                stroke="#455A64"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
              />
              <polyline
                fill="none"
                id="XMLID_4072_"
                points="     21.5,1.5 27.479,7.5 21.5,7.5 21.5,4    "
                stroke="#455A64"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
              />
              <path
                d="     M14.5,18.5c0-0.83,0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5"
                fill="none"
                id="XMLID_4071_"
                stroke="#455A64"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
              />
              <g id="XMLID_4068_">
                <path
                  d="      M20.75,15.5c0,0.41,0.34,0.75,0.75,0.75s0.75-0.34,0.75-0.75s-0.34-0.75-0.75-0.75S20.75,15.09,20.75,15.5z"
                  fill="none"
                  id="XMLID_4070_"
                  stroke="#455A64"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                />
                <path
                  d="      M11.25,15.5c0,0.41-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75s0.34-0.75,0.75-0.75S11.25,15.09,11.25,15.5z"
                  fill="none"
                  id="XMLID_4069_"
                  stroke="#455A64"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                />
              </g>
            </g>
            <g id="XMLID_2974_">
              <polyline
                fill="none"
                id="XMLID_4009_"
                points="     21.5,1.5 4.5,1.5 4.5,30.5 27.5,30.5 27.5,7.5    "
                stroke="#263238"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
              />
              <polyline
                fill="none"
                id="XMLID_4008_"
                points="     21.5,1.5 27.479,7.5 21.5,7.5 21.5,4    "
                stroke="#263238"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
              />
              <path
                d="     M14.5,18.5c0-0.83,0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5"
                fill="none"
                id="XMLID_4007_"
                stroke="#263238"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
              />
              <g id="XMLID_4004_">
                <path
                  d="      M20.75,15.5c0,0.41,0.34,0.75,0.75,0.75s0.75-0.34,0.75-0.75s-0.34-0.75-0.75-0.75S20.75,15.09,20.75,15.5z"
                  fill="none"
                  id="XMLID_4006_"
                  stroke="#263238"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                />
                <path
                  d="      M11.25,15.5c0,0.41-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75s0.34-0.75,0.75-0.75S11.25,15.09,11.25,15.5z"
                  fill="none"
                  id="XMLID_4005_"
                  stroke="#263238"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
      <h2 className={style.NoElementsLabel}>No elements to display</h2>
    </div>
  )

  const Row = useCallback(
    ({ data, index, style }) => (
      <div style={style}>
        <Renderer
          {...{ refreshElements, ...renderedProperties }}
          element={data[index]}
        />
      </div>
    ),
    [Renderer, refreshElements, renderedProperties]
  )

  return !error && !outputElements ? (
    <OurCircularProgress />
  ) : error ||
    (outputElements && outputElements.length === 0 && !allowEmpty) ? (
    message
  ) : outputElements && rendererIsContainer ? (
    <Renderer
      elements={outputElements}
      {...{ refreshElements, ...renderedProperties }}
    />
  ) : fixedList ? (
    <FixedSizeList
      itemKey={(i, itemData) =>
        i +
        '_' +
        (itemData[i].key ||
          itemData[i].id ||
          itemData[i].index ||
          itemData[i].hash ||
          itemData[i].address)
      }
      itemData={outputElements}
      itemCount={outputElements.length}
      width="100%"
      height={674}
      itemSize={100}>
      {Row}
    </FixedSizeList>
  ) : (
    outputElements.map((element, i) => (
      <Renderer
        {...{ refreshElements, ...renderedProperties }}
        key={
          i +
          '_' +
          (element.key ||
            element.id ||
            element.index ||
            element.hash ||
            element.address)
        }
        element={element}
      />
    ))
  )
}
