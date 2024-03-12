import React, { useState, useEffect } from "react";
import { SimplyDonut, SimplyLegend } from "react-simply-donut";
import style from '../../../all.module.css'
const initialData = [
  {
    "value": 10,
    "name": "Initial Daily inflation percentage",
    "color": "#000000"
  },
  {
    "value": 0,
    "name": "Option 2",
    "color": "#7474F7"
  },
  {
    "value": 0,
    "name": "Option 3",
    "color": "#FEBC33"
  },
  {
    "value": 0,
    "name": "Option 4",
    "color": "#101356"
  },
  {
    "value": 0,
    "name": "Option 5",
    "color": "#ba81ff"
  },
  {
    "value": 0,
    "name": "Option 6",
    "color": "#668C68"
  },
  {
    value: 90,
    name: "Available Space",
    isAvailableSpace: true,
    color: '#e8e8e8'

  },
];

const DonutAndLegend = (
  inflationPercentage0,
  inflationPercentage1,
  inflationPercentage2,
  inflationPercentage3,
  inflationPercentage4,
  inflationPercentage5
) => {
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

          switch (index) {
            case 0:
              inflationPercentage0 = item.value - deduction;
              break;
            case 1:
              inflationPercentage1 = item.value - deduction;
              break;
            case 2:
              inflationPercentage2 = item.value - deduction;
              break;
            case 3:
              inflationPercentage3 = item.value - deduction;
              break;
            case 4:
              inflationPercentage4 = item.value - deduction;
              break;
            case 5:
              inflationPercentage5 = item.value - deduction;
              break;
            default:
              break;
          }
          return { ...item, value: item.value - deduction };
        }

        switch (index) {
          case 0:
            inflationPercentage0 = item.value;
            break;
          case 1:
            inflationPercentage1 = item.value;
            break;
          case 2:
            inflationPercentage2 = item.value;
            break;
          case 3:
            inflationPercentage3 = item.value;
            break;
          case 4:
            inflationPercentage4 = item.value;
            break;
          case 5:
            inflationPercentage5 = item.value;
            break;
          default:
            break;
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
          <div className={style.DonutGraphContainer}>
            <SimplyDonut data={data} inset={{ color: "#fff", size: 20 }} displayScore={true} />
          </div>
        </label>

        <label className={style.CreationPageLabelF}>
          {data.map((item, index) => (
            !item.isAvailableSpace && (
              <div key={index} className={style.SliderInputElement}>
                <label>{item.name} <span className={style.SimplyDonutAreaPercentageLabel}>{item.value.toFixed(0)}%</span></label>
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
