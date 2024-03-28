import React, { useState, useCallback } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { useHistory } from 'react-router-dom'
import style from '../../../all.module.css'
import ScrollToTopOnMount from 'interfaces-ui/components/ScrollToTopOnMount'
import ActionAWeb3Button from 'components/Global/ActionAWeb3Button'
import { useEthosContext, useWeb3 } from 'interfaces-core'
import { launchFactoryV1 } from 'logic/launchFactory'
import { useEffect } from 'react'
import OurCircularProgress from 'components/Global/OurCircularProgress'

const fileTypes = ['JPG', 'PNG', 'GIF']

const FactoriesMain = () => {

  const context = useEthosContext()
  const web3Data = useWeb3()
  const history = useHistory()

  const [metadata, setMetadata] = useState({})
  const [imageFile, setImageFile] = useState(null)

  const [description, setDescription] = useState('')

  const onMetadataChange = useCallback((name, value) => setMetadata(oldValue => ({...oldValue, [name] : value})), [])

  const launchFactory = useCallback(() => launchFactoryV1({context, ...web3Data}, metadata, imageFile).then(itemAddress => history.push('/items/' + itemAddress)), [context, web3Data, metadata, imageFile])

  const [loadedImage, setLoadedImage] = useState()

  useEffect(() => {
    if(!imageFile) {
      return setLoadedImage()
    }
    setLoadedImage(null)
    const reader = new FileReader()
    reader.readAsDataURL(imageFile)
    reader.onload = () => {
      console.log(reader.result)
      setLoadedImage(reader.result)
    }
    reader.onerror = e => {
      console.log(e)
      setLoadedImage()
    }
  }, [imageFile])

  useEffect(() => onMetadataChange('description', description), [description])

  return (
    <>
      <ScrollToTopOnMount />

      <div>
        <div className={style.ItemsExploreMainTitleArea}>
          <h2 class={style.textGradientHeading}>Launch Factory</h2>
          <p>Rapid Token Deployment</p>
        </div>
        <div className={style.FactoryCreateWrapper}>
          <div className={style.FactoryCreateLeftRow}>
            <div className={style.CreationPageLabel}>
              <div className={style.FilePreview}>
                {loadedImage === null && <OurCircularProgress/>}
                {loadedImage !== null && <img
                  src={loadedImage || 'img/missingcoin.gif'}
                  width={'100%'}
                />}
              </div>
              <FileUploader
                multiple={false}
                classes={style.DropdownFileContainer}
                handleChange={setImageFile}
                types={fileTypes}
              />
            </div>
          </div>
          <div className={style.FactoryCreateRightRow}>
            <div className={style.CreationPageLabel}>
              <div className={style.FancyExplanationCreate}>
                <h2>Instant Deployment</h2>
                <p>
                  Launch Factory is for rapid deployment, for additional options
                  check out Items Creations.
                </p>
              </div>
              <label className={style.CreationPageLabelF}>
                <h6>Name*</h6>
                <p>Insert token name</p>
                <input type="text" placeholder="Token Name" value={metadata.name} onChange={e => onMetadataChange("name", e.currentTarget.value)}/>
              </label>

              <div className={style.CreationPageLabelFDivide}>
                <label className={style.CreationPageLabelF}>
                  <h6>Symbol*</h6>
                  <p>Insert token symbol</p>
                  <input type="text" placeholder="Token Symbol" value={metadata.symbol} onChange={e => onMetadataChange("symbol", e.currentTarget.value)}/>
                </label>
                <label className={style.CreationPageLabelF}>
                  <h6>Supply*</h6>
                  <p>Insert token supply</p>
                  <input type="number" placeholder="Token Supply" value={parseFloat(metadata.totalSupply)} onChange={e => onMetadataChange("totalSupply", parseFloat(e.currentTarget.value))}/>
                </label>
              </div>

              <label className={style.CreationPageLabelF}>
                <h6>Description</h6>
                <p>Enter the description of your Token</p>
                <textarea
                  mandatory="true"
                  rows={2}
                  placeholder="Describe your Token"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </label>
              <div className={style.WizardFooter}>
                <ActionAWeb3Button className={style.WizardFooterNext} onClick={launchFactory}>LAUNCH NOW!</ActionAWeb3Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

FactoriesMain.pluginIndex = 10
FactoriesMain.addToPlugin =
  ({ index }) =>
  ({ addElement }) => {
    addElement('router', {
      index,
      path: '/factories',
      Component: FactoriesMain,
      exact: true,
      requireConnection: true,
      templateProps: {
        menuName: 'appMenu',
        isDapp: true,
        link: '/factories',
      },
    })

    addElement('appMenu', {
      name: 'Launch Factory',
      label: 'Launch Factory',
      link: '/factories',
      index,
      image: `${process.env.PUBLIC_URL}/img/launchpad.png`,
    })
  }

export default FactoriesMain
