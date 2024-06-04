import React from 'react';
import style from '../../../all.module.css';

const Slider = ({ min, max = 100, step, value, onChange, className }) => {
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange(e); // Call the passed in onChange handler
        const relativeValue = (newValue - min) / (max - min) * 100;
        e.target.style.setProperty('--range-progress', `${relativeValue}%`);
    };

    const relativeValue = (value - min) / (max - min) * 100;

    return (
        <input 
            type="range" 
            min={min} 
            max={max} 
            style={{'--range-progress': `${relativeValue}%`}}
            step={step}
            value={value}
            onChange={handleInputChange} 
            className={style.slider + ' ' + className} // Use the class name from your CSS module
        />
    );
};

export default Slider;
