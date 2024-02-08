import React, { useState, useEffect } from "react";
import { SimplyDonut, SimplyLegend } from "react-simply-donut";
import style from '../../../all.module.css'
const initialData = [
    {
        "value": 10,
        "name": "First day inflation percentage",
        "color": "#000000"
      },
      {
        "value": 0,
        "name": "Second day inflation percentage",
        "color": "#7474F7"
      },
      {
        "value": 0,
        "name": "Third day inflation percentage",
        "color": "#FEBC33"
      },
      {
        "value": 0,
        "name": "Fourth day inflation percentage",
        "color": "#101356"
      },
      {
        "value": 0,
        "name": "Fifth day inflation percentage",
        "color": "#ba81ff"
      },
      {
        "value": 0,
        "name": "Sixth day inflation percentage",
        "color": "#668C68"
      },
  {
    value: 90,
    name: "Available Space",
    isAvailableSpace: true,
    color: '#e8e8e8'
  
  },
];

const DonutAndLegend = () => {
  const [data, setData] = useState(initialData);

  const handleSliderChange = (index, newValue) => {
    let newData = [...data];
    newData[index].value = newValue;
    let totalExcludingAvailable = newData.reduce((acc, item) => acc + (item.isAvailableSpace ? 0 : parseFloat(item.value)), 0);

    if (totalExcludingAvailable > 100) {
      const overflow = totalExcludingAvailable - 100;
      const distributableTotal = totalExcludingAvailable - newValue;

      newData = newData.map((item, idx) => {
        if (idx !== index && !item.isAvailableSpace) {
          const deduction = (overflow * (item.value / distributableTotal));
          return { ...item, value: item.value - deduction };
        }
        return item;
      });
    }

    const newTotalExcludingAvailable = newData.reduce((acc, item) => acc + (item.isAvailableSpace ? 0 : parseFloat(item.value)), 0);
    const availableIndex = newData.findIndex(item => item.isAvailableSpace);
    if (availableIndex !== -1) {
      newData[availableIndex].value = 100 - newTotalExcludingAvailable;
    }

    setData(newData);
  };

  return (
    <div className={style.SimplyDonutArea}>
      <div
        className={style.CreationPageLabelFDivide}
        style={{ display: 'flex' }}>
        <label className={style.CreationPageLabelF}>
            <div className={style.DonutGraphContainer}></div>
            <SimplyDonut data={data} inset={{ color: "#fff", size: 20 }} displayScore={true} />
        </label>

        <label className={style.CreationPageLabelF}>
        {data.map((item, index) => (
            !item.isAvailableSpace && (
            <div key={index} className={style.SliderInputElement}>
                <label>{item.name} <span className={style.SimplyDonutAreaPercentageLabel}>{item.value.toFixed(2)}%</span></label>
                <input
                type="range"
                value={item.value}
                min="0"
                max="100"
                onChange={(e) => handleSliderChange(index, parseFloat(e.target.value))}
                />
            </div>
            )
        ))}
          </label>
      </div>

     
    
    </div>
  );
};

export default DonutAndLegend;