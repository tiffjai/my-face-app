declare module 'canvas' {
  export class Canvas {
    width: number;
    height: number;
    getContext(contextId: '2d'): CanvasRenderingContext2D;
    toBuffer(mimeType: string): Buffer;
    createPNGStream(): any;
    createJPEGStream(): any;
    toDataURL(mimeType?: string): string;
  }

  export class CanvasRenderingContext2D {
    canvas: Canvas;
    globalAlpha: number;
    globalCompositeOperation: string;
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    filter: string;
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: ImageSmoothingQuality;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;

    save(): void;
    restore(): void;
    scale(x: number, y: number): void;
    rotate(angle: number): void;
    translate(x: number, y: number): void;
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    drawImage(image: Canvas | Image, dx: number, dy: number): void;
    drawImage(image: Canvas | Image, dx: number, dy: number, dw: number, dh: number): void;
    drawImage(image: Canvas | Image, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
    createPattern(image: Canvas | Image, repetition: string | null): CanvasPattern | null;
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    putImageData(imagedata: ImageData, dx: number, dy: number): void;
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    fillRect(x: number, y: number, width: number, height: number): void;
    beginPath(): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    fill(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    closePath(): void;
    clip(): void;
  }

  export class Image {
    width: number;
    height: number;
    src: string;
    onload: (() => void) | null;
    onerror: ((err: Error) => void) | null;
  }

  export function createCanvas(width: number, height: number): Canvas;
  export function loadImage(src: string | Buffer): Promise<Image>;
  export const VERSION: string;
}
