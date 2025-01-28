import { useState } from 'react';
import { createApi } from '@/utils/api';
import { useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

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
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Upload Portrait</CardTitle>
        <CardDescription>Select an image to begin the transformation</CardDescription>
      </CardHeader>
      <CardContent>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center w-full h-40 cursor-pointer group">
            <Input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <label 
              htmlFor="image-upload" 
              className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-accent/20 hover:bg-accent/30 transition-colors duration-300 cursor-pointer"
            >
              <svg className="w-8 h-8 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-muted-foreground mb-1">Drag and drop your image here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </label>
          </div>
        </div>
        {image && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Original</h3>
                <div className="relative rounded-lg overflow-hidden bg-accent/20">
                  <img src={image} alt="Original Image" className="w-full h-auto object-contain" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Modified</h3>
                {modifiedImage ? (
                  <img src={modifiedImage} alt="Modified Image" className="w-full h-auto rounded-lg object-contain" />
                ) : error === 'No face detected' ? (
                  <Alert variant="destructive">
                    <AlertDescription>No face detected in the image</AlertDescription>
                  </Alert>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-accent/20 rounded-lg space-y-4">
                    <Progress value={33} className="w-[60%]" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px] bg-accent/20 rounded-lg">
                    <p className="text-muted-foreground">Upload an image to see the magic</p>
                  </div>
                )}
              </div>
            </div>
            {error && error !== 'No face detected' && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadImage;
