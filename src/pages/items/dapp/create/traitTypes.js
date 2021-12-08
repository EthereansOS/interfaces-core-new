import React, { useEffect, useState } from "react"

import OurCircularProgress from '../../../../components/Global/OurCircularProgress'

import traitTypesTemplates from './traitTypesTemplates.json'

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
        return <section className="MetaImputThings" key={it}>
            {isCustom && <a className="RemoveAthing" href="javascript:" data-key={it} onClick={removeCustomTraitType}>X</a>}
            <label className="createWhat">
                <p>{it}</p>
                <input className="ITEMURLINPUT" id={it.split(' ').join('')} data-key={it} type="text" value={renterTraitTypeValue(it)} onChange={onTraitTypeValueChange} />
            </label>
        </section>
    }

    function renderNewTraitType() {
        return <section className="NewTrait">
            <h6>Add Custom Trait</h6>
            <input className="ITEMURLINPUT" type="text" value={newTraitType} onChange={e => setNewTraitType(e.currentTarget.value)} />
            <a className="AddAthing" href="javascript:" onClick={addCustomTraitType}>Add</a>
        </section>
    }

    return !traitTypesTemplates ? <OurCircularProgress /> : <section className="MetaDataThings">
        <section className="spacialImputs">
            <h3>Traits</h3>
            {standardTraitTypes.map(it => renderTraitTypeElement(it))}
            {customTraitTypes.map(it => renderTraitTypeElement(it, true))}
            {renderNewTraitType()}
        </section>
    </section>
}