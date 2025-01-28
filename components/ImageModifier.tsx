'use client';

import React, { useState, useEffect } from 'react';
import type { Human as HumanType, Config, FaceResult, Point } from '@vladmandic/human';
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
import { Slider } from "@/components/ui/slider"

interface ImageModifierProps {
  image: string;
}

const ImageModifier: React.FC<ImageModifierProps> = ({ image }) => {
  const [eyeSize, setEyeSize] = useState(1);
  const [faceSize, setFaceSize] = useState(1);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const modifyImage = async (newEyeSize: number, newFaceSize: number) => {
    if (!human) {
      setError('Face detection model not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Create an image element from the base64 data
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create a canvas to draw and modify the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Detect faces
      const result = await human.detect(img) as { face: FaceResult[] };
      
      if (!result.face || result.face.length === 0) {
        throw new Error('No face detected');
      }

      const face = result.face[0];
      if (!face.mesh) {
        throw new Error('No facial landmarks detected');
      }

      // Extract facial feature points and modify them
      // This is a simplified version - you would need to implement the actual face modification logic here
      // For now, we'll just draw the detected face points to show it's working
      ctx.fillStyle = 'red';
      if (Array.isArray(face.mesh) && face.mesh.length > 0) {
        face.mesh.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point[0], point[1], 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Convert the modified canvas back to base64
      const modifiedImageData = canvas.toDataURL('image/jpeg');
      setModifiedImage(modifiedImageData);
    } catch (error: any) {
      console.error('Error modifying image:', error);
      setError(error.message || 'Failed to modify image');
      setModifiedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEyeSizeChange = async (newSize: number) => {
    setEyeSize(newSize);
    await modifyImage(newSize, faceSize);
  };

  const handleFaceSizeChange = async (newSize: number) => {
    setFaceSize(newSize);
    await modifyImage(eyeSize, newSize);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm max-h-[calc(100vh-2rem)] overflow-y-auto">
      <CardHeader>
        <CardTitle>Adjust Features</CardTitle>
        <CardDescription>Fine-tune facial features with precision</CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <label className="text-sm font-medium">Eye Size</label>
              </div>
              <span className="text-sm bg-accent/20 px-2 py-1 rounded-full tabular-nums">{eyeSize.toFixed(1)}x</span>
            </div>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[eyeSize]}
              onValueChange={([value]: [number]) => handleEyeSizeChange(value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <label className="text-sm font-medium">Face Size</label>
              </div>
              <span className="text-sm bg-accent/20 px-2 py-1 rounded-full tabular-nums">{faceSize.toFixed(1)}x</span>
            </div>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[faceSize]}
              onValueChange={([value]: [number]) => handleFaceSizeChange(value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>
        </div>
        </div>

        <div className="pt-6 border-t space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Progress value={33} className="w-[60%]" />
              <p className="text-sm text-muted-foreground">Processing changes...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {modifiedImage && !isLoading && (
            <div className="rounded-lg overflow-hidden bg-accent/20 h-[300px]">
              <img src={modifiedImage} alt="Modified" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageModifier;
