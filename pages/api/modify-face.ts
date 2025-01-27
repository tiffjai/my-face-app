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
    const { image, eyeSize, faceSize } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (typeof eyeSize !== 'number' || eyeSize < 0.5 || eyeSize > 2 ||
        typeof faceSize !== 'number' || faceSize < 0.5 || faceSize > 2) {
      return res.status(400).json({ error: 'Invalid size values' });
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

    // Extract facial feature points
    const leftUpperEyelid = face.mesh.slice(36, 40).map((p) => ({ x: p[0], y: p[1] })) as Point[];
    const leftLowerEyelid = face.mesh.slice(40, 42).map((p) => ({ x: p[0], y: p[1] })) as Point[];
    const rightUpperEyelid = face.mesh.slice(42, 46).map((p) => ({ x: p[0], y: p[1] })) as Point[];
    const rightLowerEyelid = face.mesh.slice(46, 48).map((p) => ({ x: p[0], y: p[1] })) as Point[];
    const leftIris = face.mesh.slice(474, 478).map((p) => ({ x: p[0], y: p[1] })) as Point[];
    const rightIris = face.mesh.slice(469, 473).map((p) => ({ x: p[0], y: p[1] })) as Point[];

    const leftIrisCenter = calculateCenter(leftIris);
    const rightIrisCenter = calculateCenter(rightIris);

    // Calculate iris sizes
    const leftIrisRadius = Math.max(
      ...leftIris.map(p => 
        Math.sqrt(Math.pow(p.x - leftIrisCenter.x, 2) + Math.pow(p.y - leftIrisCenter.y, 2))
      )
    );
    const rightIrisRadius = Math.max(
      ...rightIris.map(p => 
        Math.sqrt(Math.pow(p.x - rightIrisCenter.x, 2) + Math.pow(p.y - rightIrisCenter.y, 2))
      )
    );

    // Create a new canvas for the modified image
    const outputCanvas = createCanvas(canvas.width, canvas.height);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.drawImage(canvas, 0, 0);

    // First scale the irises
    await scaleIris(
      outputCtx,
      canvas,
      leftIrisCenter,
      leftIrisRadius,
      eyeSize * 1.2 // Increase iris size more than the overall eye
    );
    await scaleIris(
      outputCtx,
      canvas,
      rightIrisCenter,
      rightIrisRadius,
      eyeSize * 1.2
    );

    // Then adjust eyelids to match
    await adjustEyelids(
      outputCtx,
      leftUpperEyelid,
      leftLowerEyelid,
      leftIrisCenter,
      leftIrisRadius,
      eyeSize
    );
    await adjustEyelids(
      outputCtx,
      rightUpperEyelid,
      rightLowerEyelid,
      rightIrisCenter,
      rightIrisRadius,
      eyeSize
    );

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

// Scale and draw iris
async function scaleIris(
  ctx: import('canvas').CanvasRenderingContext2D,
  sourceCanvas: import('canvas').Canvas,
  center: Point,
  radius: number,
  scale: number
) {
  try {
    const size = Math.ceil(radius * 3); // Larger area to ensure we capture the full iris
    const x = Math.floor(center.x - size/2);
    const y = Math.floor(center.y - size/2);

    // Create temporary canvas for iris
    const tempCanvas = createCanvas(size, size);
    const tempCtx = tempCanvas.getContext('2d');

    // Copy iris region
    tempCtx.drawImage(
      sourceCanvas,
      x, y, size, size,
      0, 0, size, size
    );

    // Create circular mask for iris
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.beginPath();
    tempCtx.arc(size/2, size/2, radius, 0, Math.PI * 2);
    tempCtx.fill();
    tempCtx.globalCompositeOperation = 'source-over';

    // Scale and draw iris
    const scaledSize = Math.ceil(size * scale);
    const offset = (scaledSize - size) / 2;

    ctx.save();
    ctx.drawImage(
      tempCanvas,
      0, 0, size, size,
      x - offset, y - offset, scaledSize, scaledSize
    );
    ctx.restore();
  } catch (error) {
    console.error('Error in scaleIris:', error);
    throw error;
  }
}

// Adjust eyelids to match iris size
async function adjustEyelids(
  ctx: import('canvas').CanvasRenderingContext2D,
  upperLid: Point[],
  lowerLid: Point[],
  irisCenter: Point,
  irisRadius: number,
  scale: number
) {
  try {
    const scaledRadius = irisRadius * scale;
    const radiusDiff = scaledRadius - irisRadius;
    
    // Create paths for the eyelids
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(upperLid[0].x, upperLid[0].y);
    
    // Adjust upper eyelid
    for (let i = 1; i < upperLid.length; i++) {
      const point = upperLid[i];
      const dist = Math.sqrt(Math.pow(point.x - irisCenter.x, 2) + Math.pow(point.y - irisCenter.y, 2));
      const factor = Math.max(0, 1 - dist / (irisRadius * 3));
      const offset = radiusDiff * factor;
      ctx.lineTo(point.x, point.y - offset);
    }
    
    // Adjust lower eyelid
    for (let i = lowerLid.length - 1; i >= 0; i--) {
      const point = lowerLid[i];
      const dist = Math.sqrt(Math.pow(point.x - irisCenter.x, 2) + Math.pow(point.y - irisCenter.y, 2));
      const factor = Math.max(0, 1 - dist / (irisRadius * 3));
      const offset = radiusDiff * factor;
      ctx.lineTo(point.x, point.y + offset);
    }
    
    ctx.closePath();
    ctx.clip();
    
    // Draw the adjusted region
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.restore();
  } catch (error) {
    console.error('Error in scaleAndDrawEye:', error);
    throw error;
  }
}
