'use client';

import React, { useState, useEffect } from 'react';
import type { Human as HumanType, Config } from '@vladmandic/human';
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

  const getBoundingBox = (points: number[][]): [number, number, number, number] => {
    if (!points || points.length === 0) {
      throw new Error('No points provided for bounding box calculation');
    }
    const validPoints = points.filter(
      (point) =>
        point &&
        Array.isArray(point) &&
        point.length >= 2 &&
        point.every((coord) => Number.isFinite(coord) && coord >= 0)
    );
    if (validPoints.length === 0) {
      throw new Error('No valid points found for bounding box calculation');
    }
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    validPoints.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    const padding = Math.max(2, Math.min((maxX - minX) * 0.1, (maxY - minY) * 0.1));
    const x = Math.max(0, minX - padding);
    const y = Math.max(0, minY - padding);
    const width = Math.max(1, (maxX - minX) + padding * 2);
    const height = Math.max(1, (maxY - minY) + padding * 2);
    return [x, y, width, height];
  };

  const enlargeFeature = (
    ctx: CanvasRenderingContext2D,
    featurePoints: number[][],
    scale: number
  ) => {
    try {
      if (!featurePoints || featurePoints.length === 0) {
        throw new Error('No feature points provided');
      }
      if (!Number.isFinite(scale) || scale <= 0) {
        throw new Error(`Invalid scale value: ${scale}`);
      }
      const [x, y, width, height] = getBoundingBox(featurePoints);
      const canvasWidth = ctx.canvas.width;
      const canvasHeight = ctx.canvas.height;
      if (x < 0 || y < 0 || x + width > canvasWidth || y + height > canvasHeight) {
        throw new Error('Feature bounds exceed canvas dimensions');
      }
      const roundedX = Math.round(x);
      const roundedY = Math.round(y);
      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);
      let featureImage;
      try {
        featureImage = ctx.getImageData(roundedX, roundedY, roundedWidth, roundedHeight);
      } catch (error) {
        throw new Error(
          `Failed to get image data: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        throw new Error('Failed to create temporary canvas context');
      }
      tempCanvas.width = roundedWidth;
      tempCanvas.height = roundedHeight;
      tempCtx.putImageData(featureImage, 0, 0);
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const newX = x - (width * (scale - 1)) / 2;
      const newY = y - (height * (scale - 1)) / 2;
      if (
        newX < 0 ||
        newY < 0 ||
        newX + scaledWidth > canvasWidth ||
        newY + scaledHeight > canvasHeight
      ) {
        throw new Error('Scaled feature would exceed canvas bounds');
      }
      ctx.clearRect(x, y, width, height);
      ctx.drawImage(tempCanvas, newX, newY, scaledWidth, scaledHeight);
    } catch (error) {
      console.error('Error in enlargeFeature:', error);
      throw error;
    }
  };

  const shrinkFace = (
    ctx: CanvasRenderingContext2D,
    jawline: number[][],
    scale: number
  ) => {
    try {
      if (!jawline || jawline.length === 0) {
        throw new Error('No jawline points provided');
      }
      if (!Number.isFinite(scale) || scale <= 0) {
        throw new Error(`Invalid scale value: ${scale}`);
      }
      const canvasWidth = ctx.canvas.width;
      const canvasHeight = ctx.canvas.height;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const transformedJawline = jawline.map((point) => {
        if (!Array.isArray(point) || point.length < 2) {
          throw new Error('Invalid jawline point detected');
        }
        const [x, y] = point;
        const newX = x * scale + (1 - scale) * centerX;
        const newY = y * scale + (1 - scale) * centerY;
        if (newX < 0 || newX > canvasWidth || newY < 0 || newY > canvasHeight) {
          throw new Error('Transformed point would exceed canvas bounds');
        }
        return [newX, newY];
      });
      transformedJawline.forEach((point, index) => {
        jawline[index] = point;
      });
      if ('filter' in ctx) {
        ctx.filter = 'blur(2px)';
      } else {
        console.warn('Canvas filter not supported in this browser');
      }
      ctx.globalAlpha = 0.9;
    } catch (error) {
      console.error('Error in shrinkFace:', error);
      throw error;
    }
  };

  // Updated helper to extract feature points—strip extra coordinates if needed
  const getFeaturePoints = (mesh: any[], indices: number[], featureName: string): number[][] => {
    const rawPoints = indices.map((i) => mesh[i]);
    const validPoints = rawPoints.map((point, idx) => {
      if (Array.isArray(point) && point.length >= 2) {
        const x = Number(point[0]);
        const y = Number(point[1]);
        if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0) {
          return [x, y];
        } else {
          console.error(`${featureName} point ${idx} has non-finite or negative coordinates:`, point);
        }
      } else {
        console.error(`${featureName} point ${idx} is invalid:`, point);
      }
      return null;
    }).filter((pt) => pt !== null) as number[][];

    console.log(`${featureName} validation report:`, {
      requested: indices.length,
      validPoints: validPoints.length,
      points: validPoints,
    });

    return validPoints;
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
      if (!result.face || result.face.length === 0) {
        throw new Error(
          'No face detected in the image. Please ensure your face is clearly visible.'
        );
      }
      if (result.face.length > 1) {
        console.warn('Multiple faces detected, using the first face');
      }
      const face = result.face[0];
      if (!face.score || face.score < 0.7) {
        throw new Error(
          'Face detection confidence is too low. Please ensure better lighting and face visibility.'
        );
      }
      if (!face.mesh) {
        throw new Error(
          'No facial landmarks detected. Please ensure your face is clearly visible and not obscured.'
        );
      }
      if (!Array.isArray(face.mesh)) {
        throw new Error('Invalid facial mesh structure detected.');
      }
      if (face.mesh.length < 468) {
        console.error('Unexpected number of mesh points:', {
          expected: 468,
          found: face.mesh.length,
          meshData: face.mesh,
        });
        throw new Error(
          'Incomplete facial feature detection. Please ensure your face is well-lit and directly facing the camera.'
        );
      }

      // Define indices for left/right eyes and jawline.
      const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133];
      const rightEyeIndices = [263, 249, 390, 373, 374, 380, 381, 382, 362];
      const jawlineIndices = Array.from({ length: 17 }, (_, i) => i);

      const leftEye = getFeaturePoints(face.mesh, leftEyeIndices, 'left eye');
      const rightEye = getFeaturePoints(face.mesh, rightEyeIndices, 'right eye');
      const jawline = getFeaturePoints(face.mesh, jawlineIndices, 'jawline');

      if (leftEye.length === 0) {
        throw new Error('Left eye landmarks not properly detected.');
      }
      if (rightEye.length === 0) {
        throw new Error('Right eye landmarks not properly detected.');
      }
      if (jawline.length === 0) {
        throw new Error('Jawline landmarks not properly detected.');
      }

      console.log('Enlarging left eye');
      enlargeFeature(ctx, leftEye, newEyeSize);
      console.log('Enlarging right eye');
      enlargeFeature(ctx, rightEye, newEyeSize);
      console.log('Shrinking face via jawline');
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
