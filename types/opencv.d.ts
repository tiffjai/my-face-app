declare module 'opencv4nodejs' {
  export class Mat {
    constructor(rows: number, cols: number, type: number);
    data: Uint8Array;
    cols: number;
    rows: number;
    delete(): void;
    static zeros(size: { width: number; height: number }, type: number): Mat;
  }

  export class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  export class Scalar {
    constructor(v0: number, v1?: number, v2?: number, v3?: number);
  }

  export class Rect {
    constructor(x: number, y: number, width: number, height: number);
    size(): { width: number; height: number };
  }

  export function matFromArray(rows: number, cols: number, type: number, array: number[]): Mat;
  export function getAffineTransform(src: Mat, dst: Mat): Mat;
  export function warpAffine(
    src: Mat,
    dst: Mat,
    M: Mat,
    dsize: { width: number; height: number },
    flags?: number,
    borderMode?: number,
    borderValue?: any
  ): void;
  export function fillConvexPoly(mat: Mat, points: Point[], color: Scalar): void;
  export function imshow(canvas: any, mat: Mat): void;

  export const CV_8UC1: number;
  export const CV_8UC4: number;
  export const CV_32FC2: number;
  export const INTER_LINEAR: number;
  export const BORDER_CONSTANT: number;
}
