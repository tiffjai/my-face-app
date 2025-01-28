'use client';

import { useState, useEffect } from 'react';
import type { Human as HumanType, Config } from '@vladmandic/human';
import * as Human from '@vladmandic/human';
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
import { Button } from "@/components/ui/button"

interface Props {
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const UploadImage: React.FC<Props> = ({ setImage }) => {
  const [image, setLocalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [human, setHuman] = useState<HumanType | null>(null);

  useEffect(() => {
    const initHuman = async () => {
      const humanConfig: Partial<Config> = {
        backend: 'webgl',
        modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
        face: { enabled: true },
      };
      const newHuman = new Human.Human(humanConfig);
      await newHuman.load();
      setHuman(newHuman);
    };
    initHuman();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      // Verify face detection works
      if (!human) {
        throw new Error('Face detection not initialized');
      }

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      const result = await human.detect(img);
      if (!result.face || result.face.length === 0) {
        throw new Error('No face detected');
      }

      setLocalImage(imageData);
      setImage(imageData);
    } catch (err: any) {
      console.error('Error processing image:', err);
      setError(err.message || 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <CardHeader>
        <CardTitle>Upload Portrait</CardTitle>
        <CardDescription>Select an image to begin the transformation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center w-full h-32 cursor-pointer group">
            <Input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <label 
              htmlFor="image-upload" 
              className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-background hover:bg-accent/5 transition-colors duration-300 cursor-pointer"
            >
              <svg className="w-8 h-8 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-muted-foreground mb-1">Drag and drop your image here or</p>
              <Button variant="secondary" size="sm" className="text-xs">
                Choose File
              </Button>
            </label>
          </div>
        </div>
        {image && (
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Original</h3>
              <div className="relative rounded-lg overflow-hidden bg-accent/20 h-[300px]">
                <img src={image} alt="Original Image" className="w-full h-full object-contain" />
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
