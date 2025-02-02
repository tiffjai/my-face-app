'use client';

import React, { useState, useEffect } from 'react';
import type { Human as HumanType, Config, FaceResult } from '@vladmandic/human';
import * as Human from '@vladmandic/human';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';

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

  const getBoundingBox = (points: number[][]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
    return [minX, minY, maxX - minX, maxY - minY];
  };

  const enlargeFeature = (ctx: CanvasRenderingContext2D, featurePoints: number[][], scale: number) => {
    const [x, y, width, height] = getBoundingBox(featurePoints);
    const featureImage = ctx.getImageData(x, y, width, height);
    
    // Temporary canvas to resize feature
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    tempCanvas.width = width * scale;
    tempCanvas.height = height * scale;
    
    tempCtx.putImageData(featureImage, 0, 0);
    ctx.clearRect(x, y, width, height);
    ctx.drawImage(tempCanvas, x - (width * (scale - 1)) / 2, y - (height * (scale - 1)) / 2, width * scale, height * scale);
  };

  const shrinkFace = (ctx: CanvasRenderingContext2D, jawline: number[][], scale: number) => {
    jawline.forEach((point, index) => {
      jawline[index] = [
        point[0] * scale + (1 - scale) * ctx.canvas.width / 2,
        point[1] * scale + (1 - scale) * ctx.canvas.height / 2
      ];
    });

    ctx.filter = "blur(2px)";
    ctx.globalAlpha = 0.9;
  };

  const modifyImage = async (newEyeSize: number, newFaceSize: number) => {
    if (!human) {
      setError('Face detection model not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(img, 0, 0);

      const result = await human.detect(img);
      if (!result.face || result.face.length === 0) throw new Error('No face detected');

      const face = result.face[0];
      if (!face.mesh) throw new Error('No facial landmarks detected');

      // Get feature points
const leftEye = face.mesh.slice(36, 42) as number[][]; // Left eye
const rightEye = face.mesh.slice(42, 48) as number[][]; // Right eye
const jawline = face.mesh.slice(0, 17) as number[][]; // Face contour

      // Apply transformations
      enlargeFeature(ctx, leftEye, newEyeSize);
      enlargeFeature(ctx, rightEye, newEyeSize);
      shrinkFace(ctx, jawline, newFaceSize);

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

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm max-h-[calc(100vh-2rem)] overflow-y-auto">
      <CardHeader>
        <CardTitle>Adjust Features</CardTitle>
        <CardDescription>Fine-tune facial features with precision</CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-medium">Eye Size</label>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={[eyeSize]}
            onValueChange={([value]: [number]) => {
              setEyeSize(value);
              modifyImage(value, faceSize);
            }}
            className="w-full"
          />
          <label className="text-sm font-medium">Face Size</label>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={[faceSize]}
            onValueChange={([value]: [number]) => {
              setFaceSize(value);
              modifyImage(eyeSize, value);
            }}
            className="w-full"
          />
        </div>

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
      </CardContent>
    </Card>
  );
};

export default ImageModifier;
