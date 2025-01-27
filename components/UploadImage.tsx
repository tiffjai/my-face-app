import { useState } from 'react';
import { createApi } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import styles from '@/styles.css';

interface Props {
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const UploadImage: React.FC<Props> = ({ setImage }) => {
  const [image, setLocalImage] = useState<string | null>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { modifyFace } = createApi();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const imageData = e.target.result as string;
        setLocalImage(imageData);
        setImage(imageData);
        try {
          setIsLoading(true);
          setError(null);
          await modifyFace.mutateAsync({ image: imageData });
          setModifiedImage(imageData);
        } catch (error: any) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Upload Image</h2>
        <p className="text-gray-600 mb-4">Upload an image to modify facial features.</p>
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          className="w-full border border-gray-300 px-3 py-2 rounded-md mb-4"
        />
        {image && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <img src={image} alt="Original Image" className="w-full h-auto" />
            {modifiedImage ? (
              <img src={modifiedImage} alt="Modified Image" className="w-full h-auto" />
            ) : error === 'No face detected' ? (
              <p className="text-red-500 text-center">No face detected</p>
            ) : isLoading ? (
              <p className="text-center">Processing...</p>
            ) : (
              <p className="text-center">Upload an image</p>
            )}
            {error && error !== 'No face detected' && <p className="text-red-500 text-center">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImage;
