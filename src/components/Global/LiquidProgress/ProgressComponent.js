import React, { useState, useEffect } from 'react'
import './ProgressComponent.css' // Make sure to create this CSS file based on the provided CSS
import Slider from '../../../components/Global/Slider'

const ProgressComponent = ({ maxPercentagePerToken, onChange }) => {
  const [progressValue, setProgressValue] = useState(maxPercentagePerToken)

  const handleInputChange = (e) => {
    const value = Math.max(0, Math.min(100, e.target.value)) // Ensure the value is between 0 and 100
    setProgressValue(value)
  }

  useEffect(() => {
    onChange(progressValue)
  }, [progressValue])

  return (
    <div>
      <div
        className={`progress ${progressValue > 50 ? 'progress--upper-half-value' : ''
          }`}
        data-value={progressValue}
        style={{ '--progress-value': progressValue }}>
        <div className="progress-inner">
          <div className="progress-indicator"></div>
          <div className="progress-indicator"></div>
        </div>
        <span className="progress-label">
          <strong>{progressValue}</strong>
          <span>%</span>
        </span>
      </div>
      <div className="description">
        <div>Select Percentage </div>
        <Slider
          min="0"
          max="100"
          step="1"
          value={progressValue}
          onChange={handleInputChange}
        />
      </div>
    </div>
  )
}

export default ProgressComponent
