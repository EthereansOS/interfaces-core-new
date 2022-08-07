import React from 'react'
import LogoRenderer from '../../Global/LogoRenderer'
import OurCircularProgress from '../../Global/OurCircularProgress'

export default props => {
    if(!props || !props.input) {
        return <OurCircularProgress/>
    }
    return <LogoRenderer badge {...{...props }}/>
}