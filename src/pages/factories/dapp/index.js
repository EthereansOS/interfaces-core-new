import React, { useState } from 'react'
import { FileUploader } from "react-drag-drop-files";
import style from '../../../all.module.css'

const FactoriesMain = () => {
  const fileTypes = ["JPG", "PNG", "GIF"];
  const [file, setFile] = useState(null);
  const handleChange = (file) => {
    setFile(file);
  };
  return (
    <>
      <div>
        <div className={style.ItemsExploreMainTitleArea}>
          <h2 class={style.textGradientHeading}>Launch Factories</h2>
          <p>Rapid Token Deployment</p>
        </div>
        <div className={style.FactoryCreateWrapper}>
          <div className={style.FactoryCreateLeftRow}>
            <div className={style.CreationPageLabel}>
              <div className={style.FilePreview}>
                <img src="https://img.freepik.com/premium-photo/3d-rendering-left-view-cryptocurrency-btc-bitcoin-black-gold-coin-with-cartoon-style_477250-141.jpg" width={"100%"} />
              </div>
              <FileUploader multiple={false} classes={style.DropdownFileContainer} handleChange={handleChange} name="file" types={fileTypes} />
            </div>
          </div>
          <div className={style.FactoryCreateRightRow}>
            <div className={style.CreationPageLabel}>
              <div className={style.FancyExplanationCreate}>
                <h2>Instant Deployment</h2>
                <p>Launch Factory is for rapid deployment, for additional options check out Items Creations.</p>
              </div>
              <label className={style.CreationPageLabelF}>
                <h6>Name*</h6>
                <p>Insert token name</p>
                <input
                  type="text"
                  placeholder="Token Name"
                />
              </label>

                <div
                  className={style.CreationPageLabelFDivide}
                 >
                  <label className={style.CreationPageLabelF}>
                    <h6>Symbol*</h6>
                    <p>Insert token symbol</p>
                    <input
                      type="text"
                      placeholder="Token Symbol"
                    />
                  </label>
                  <label className={style.CreationPageLabelF}>
                    <h6>Supply*</h6>
                    <p>Insert token supply</p>
                    <input
                      type="text"
                      placeholder="Token Supply"
                    />
                  </label>
                </div>
              
              <label className={style.CreationPageLabelF}>
                <h6>Description</h6>
                <p>Enter the description of your Token</p>
                <textarea
                  mandatory="true"
                  rows={2}
                  placeholder="Describe your Token"
                />
              </label>
              <div className={style.WizardFooter}>
                <button
                  className={style.WizardFooterNext}>
                  LAUNCH NOW!
                </button>
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
