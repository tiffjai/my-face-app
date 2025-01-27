import React, { useState } from 'react';
import axios from 'axios';

const ImageModifier: React.FC = () => {
  const [eyeSize, setEyeSize] = useState(1);
  const [faceSize, setFaceSize] = useState(1);

  const handleEyeSizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(event.target.value);
    setEyeSize(newSize);
    await axios.post('/api/modify-face', { eyeSize: newSize, faceSize });
  };

  const handleFaceSizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(event.target.value);
    setFaceSize(newSize);
    await axios.post('/api/modify-face', { eyeSize, faceSize: newSize });
  };

  return (
    <div>
      <div>
        <label>Eye Size</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={eyeSize}
          onChange={handleEyeSizeChange}
        />
      </div>
      <div>
        <label>Face Size</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={faceSize}
          onChange={handleFaceSizeChange}
        />
      </div>
    </div>
  );
};

export default ImageModifier;
