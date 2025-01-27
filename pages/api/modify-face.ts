import type { NextApiRequest, NextApiResponse } from 'next';
import { Human, FaceResult } from '@vladmandic/human';
import { Point } from '../../types/Point';
import { createCanvas, loadImage } from 'canvas';
import * as tf from '@tensorflow/tfjs-node';

const human = new Human({
  backend: 'tensorflow',
  modelBasePath: process.env.MODEL_PATH || 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
  face: { enabled: true },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, eyeSize } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (typeof eyeSize !== 'number' || eyeSize < 0.5 || eyeSize > 2) {
      return res.status(400).json({ error: 'Invalid eye size value' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const loadedImage = await loadImage(buffer);
    
    // Create a resized canvas
    const MAX_WIDTH = 640;
    const MAX_HEIGHT = 480;
    let width = loadedImage.width;
    let height = loadedImage.height;
    
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(loadedImage, 0, 0);

    await human.load();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const tensor = tf.tensor3d(new Uint8Array(imageData.data), [canvas.height, canvas.width, 4]);
    const result = await human.detect(tensor) as { face: FaceResult[] };
    tensor.dispose();

    if (!result || !result.face || result.face.length === 0) {
      return res.status(400).json({ error: 'No face detected' });
    }

    const face = result.face[0];
    if (!face.mesh) {
      return res.status(400).json({ error: 'No facial landmarks detected' });
    }

    // Extract eye points
    const leftEye = face.mesh.slice(36, 42).map((p) => ({ x: p[0], y: p[1] })) as Point[];
    const rightEye = face.mesh.slice(42, 48).map((p) => ({ x: p[0], y: p[1] })) as Point[];

    const leftEyeCenter = calculateCenter(leftEye);
    const rightEyeCenter = calculateCenter(rightEye);

    // Apply eye size transformations
    const leftEyeBounds = calculateEyeBounds(leftEye);
    const rightEyeBounds = calculateEyeBounds(rightEye);

    // Create a new canvas for the modified image
    const outputCanvas = createCanvas(canvas.width, canvas.height);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.drawImage(canvas, 0, 0);

    // Scale and draw eyes
    await scaleAndDrawEye(outputCtx, canvas, leftEyeBounds, leftEyeCenter, eyeSize);
    await scaleAndDrawEye(outputCtx, canvas, rightEyeBounds, rightEyeCenter, eyeSize);

    const modifiedImageBuffer = outputCanvas.toBuffer('image/jpeg');
    const modifiedImageBase64 = `data:image/jpeg;base64,${modifiedImageBuffer.toString('base64')}`;

    return res.status(200).send(modifiedImageBase64);
  } catch (error: any) {
    console.error('Error processing image:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}

// Helper to calculate the center of points
function calculateCenter(points: Point[]): Point {
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
}

// Calculate eye bounds
function calculateEyeBounds(points: Point[]) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Scale and draw eye region centered on the eye
async function scaleAndDrawEye(
  ctx: import('canvas').CanvasRenderingContext2D,
  sourceCanvas: import('canvas').Canvas,
  bounds: { x: number; y: number; width: number; height: number },
  center: Point,
  scale: number
) {
  try {
    // Calculate dimensions based on eye size
    const eyeWidth = bounds.width;
    const eyeHeight = bounds.height;
    const padding = Math.ceil(eyeWidth * 0.15); // Smaller padding, just 15% of eye width
    
    // Define the region to transform
    const x = Math.floor(bounds.x - padding);
    const y = Math.floor(bounds.y - padding);
    const width = Math.ceil(eyeWidth + (padding * 2));
    const height = Math.ceil(eyeHeight + (padding * 2));

    // Save the original state
    ctx.save();
    
    // Create a temporary canvas for the eye region
    const tempCanvas = createCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copy the eye region to temp canvas
    tempCtx.drawImage(
      sourceCanvas,
      x, y, width, height,
      0, 0, width, height
    );

    // Calculate scale relative to eye center
    const relativeScale = 1 + (scale - 1) * 0.6; // Reduce the scaling effect
    const scaledWidth = Math.ceil(width * relativeScale);
    const scaledHeight = Math.ceil(height * relativeScale);
    
    // Calculate offsets to maintain eye center position
    const centerOffsetX = (scaledWidth - width) / 2;
    const centerOffsetY = (scaledHeight - height) / 2;

    // Draw the scaled eye region back to the main canvas
    ctx.drawImage(
      tempCanvas,
      0, 0, width, height,
      x - centerOffsetX, y - centerOffsetY, scaledWidth, scaledHeight
    );

    ctx.restore();
  } catch (error) {
    console.error('Error in scaleAndDrawEye:', error);
    throw error;
  }
}
