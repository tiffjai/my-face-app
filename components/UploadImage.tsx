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
          const response = await modifyFace.mutateAsync({ 
            image: imageData,
            eyeSize: 1,
            faceSize: 1
          });
          setModifiedImage(response);
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
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-[#FFD1C3] shadow-[0_4px_20px_-4px_rgba(255,139,107,0.1)] hover:shadow-[0_4px_20px_-4px_rgba(255,139,107,0.2)] transition-shadow duration-300">
      <div className="w-full">
        <div className="border-b border-[#FFE4DC] px-8 py-6">
          <h2 className="text-xl text-[#FF8B6B] font-light">Upload Portrait</h2>
          <p className="text-[#FF6B6B] text-sm mt-1">Select an image to begin the transformation</p>
        </div>
        
        <label className="flex flex-col items-center justify-center w-full h-40 px-8 py-6 cursor-pointer group">
          <div className="w-full h-full border-2 border-dashed border-[#FFD1C3] rounded-lg flex flex-col items-center justify-center bg-[#FFEBE3]/30 group-hover:bg-[#FFEBE3]/50 transition-colors duration-300">
            <svg className="w-8 h-8 text-[#FF8B6B] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-[#FF8B6B] mb-1">Drag and drop your image here</p>
            <p className="text-xs text-[#FF6B6B]">or click to browse</p>
          </div>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </label>
        {image && (
          <div className="px-8 py-6 border-t border-[#FFE4DC]">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#FF8B6B]">Original</h3>
                <div className="relative rounded-lg overflow-hidden bg-[#FFEBE3]/30">
                  <img src={image} alt="Original Image" className="w-full h-auto object-contain" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#FF8B6B]">Modified</h3>
                {modifiedImage ? (
                  <img src={modifiedImage} alt="Modified Image" className="w-full h-auto rounded-lg object-contain" />
                ) : error === 'No face detected' ? (
                  <div className="flex items-center justify-center h-full min-h-[200px] bg-red-50/50 rounded-lg">
                    <p className="text-red-500 font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      No face detected
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[200px] bg-[#FFEBE3]/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#FF8B6B] border-t-transparent"></div>
                      <p className="text-[#FF8B6B] font-medium">Processing...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px] bg-[#FFEBE3]/30 rounded-lg">
                    <p className="text-[#FF8B6B]">Upload an image to see the magic</p>
                  </div>
                )}
              </div>
            </div>
            {error && error !== 'No face detected' && (
              <div className="mt-4 p-4 bg-red-50/50 rounded-lg">
                <p className="text-red-500 text-center font-medium">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImage;