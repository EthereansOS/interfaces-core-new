import React, { useEffect, useState } from "react"

import OurCircularProgress from '../../../../components/Global/OurCircularProgress'

import traitTypesTemplates from './traitTypesTemplates.json'
import style from '../../../../all.module.css'

export default ({ state, onStateEntry }) => {

    const attributes = state.attributes || []
    const [newTraitType, setNewTraitType] = useState("")

    var standardTraitTypes = []
    if (traitTypesTemplates) {
        //standardTraitTypes.push(...traitTypesTemplates["global"])
        //standardTraitTypes.push(...traitTypesTemplates[state.metadataType])
    }

    var customTraitTypes = attributes.filter(it => it.trait_type && standardTraitTypes.indexOf(it.trait_type) === -1).map(it => it.trait_type)

    function addCustomTraitType(e) {
        var allTraitTypes = standardTraitTypes.map(it => it.split(' ').join('').toLowerCase())
        allTraitTypes.push(...customTraitTypes.map(it => it.split(' ').join('').toLowerCase()))
        if (allTraitTypes.indexOf(newTraitType.split(" ").join('').toLowerCase()) !== -1) {
            return
        }
        var newAttributes = attributes.map(it => it)
        newAttributes.push({
            trait_type: newTraitType,
            value: ''
        })
        onStateEntry('attributes', newAttributes || [])
        setNewTraitType("")
    }

    function removeCustomTraitType(e) {
        var key = e.currentTarget.dataset.key
        var index = attributes.indexOf(attributes.filter(it => it.trait_type === key))
        var newAttributes = attributes.map(it => it)
        newAttributes.splice(index, 1)
        onStateEntry('attributes', newAttributes || [])
    }

    function renterTraitTypeValue(key) {
        try {
            return attributes.filter(it => it.trait_type === key)[0].value
        } catch (e) {
            return ""
        }
    }

    function onTraitTypeValueChange(e) {
        var key = e.currentTarget.dataset.key
        var value = e.currentTarget.value
        var newAttributes = attributes.map(it => it)
        try {
            newAttributes.filter(it => it.trait_type === key)[0].value = value
        } catch (e) {
            newAttributes.push({
                trait_type: key,
                value
            })
        }
        onStateEntry('attributes', newAttributes || [])
    }

    function renderTraitTypeElement(it, isCustom) {
        return <div className={style.CreationPageLabelF}>
            <div key={it}>
                <h6>{it}</h6>
                <input id={it.split(' ').join('')} data-key={it} type="text" value={renterTraitTypeValue(it)} onChange={onTraitTypeValueChange} />
                {isCustom && <a className={style.RoundedButton} href="javascript:" data-key={it} onClick={removeCustomTraitType}>X</a>}
            </div>
        </div>
    }

    function renderNewTraitType() {
        return <> 
            <div className={style.CreationPageLabelF}>
                <h6>New Trait</h6>
                <input type="text" value={newTraitType} onChange={e => setNewTraitType(e.currentTarget.value)} />
                <a className={style.RoundedButton} href="javascript:" onClick={addCustomTraitType}>+</a>
            </div>
        </>
    }

    return !traitTypesTemplates ? <OurCircularProgress /> : <section>
        <section>
            <div className={style.FancyExplanationCreate}>
                <h2>Traits</h2>
            </div>
            {standardTraitTypes.map(it => renderTraitTypeElement(it))}
            {customTraitTypes.map(it => renderTraitTypeElement(it, true))}
            {renderNewTraitType()}
        </section>
    </section>
}