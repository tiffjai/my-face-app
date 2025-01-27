import React, { useState } from 'react';
import axios from 'axios';

interface ImageModifierProps {
  image: string;
}

const ImageModifier: React.FC<ImageModifierProps> = ({ image }) => {
  const [eyeSize, setEyeSize] = useState(1);
  const [faceSize, setFaceSize] = useState(1);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const modifyImage = async (newEyeSize: number, newFaceSize: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/modify-face', {
        image,
        eyeSize: newEyeSize,
        faceSize: newFaceSize
      });
      setModifiedImage(response.data);
    } catch (error: any) {
      console.error('Error modifying image:', error);
      setError(error.response?.data?.error || 'Failed to modify image');
      setModifiedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEyeSizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(event.target.value);
    setEyeSize(newSize);
    await modifyImage(newSize, faceSize);
  };

  const handleFaceSizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(event.target.value);
    setFaceSize(newSize);
    await modifyImage(eyeSize, newSize);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 bg-white rounded-lg shadow-sm">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">Eye Size</label>
          <span className="text-sm text-gray-500">{eyeSize.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={eyeSize}
          onChange={handleEyeSizeChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">Face Size</label>
          <span className="text-sm text-gray-500">{faceSize.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={faceSize}
          onChange={handleFaceSizeChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
      <div className="mt-6">
        {isLoading && <p className="text-center">Processing...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {modifiedImage && !isLoading && (
          <div>
            <img src={modifiedImage} alt="Modified" className="max-w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModifier;
