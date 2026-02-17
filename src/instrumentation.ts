// Next.js instrumentation runs before any other server-side code.
// We polyfill browser APIs needed by pdfjs-dist (used by pdf-parse v2).
// These are only needed for rendering; text extraction works without them,
// but pdfjs-dist checks for their existence at module load time.

export async function register() {
  if (typeof globalThis.DOMMatrix === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      is2D = true; isIdentity = true;
      inverse() { return new DOMMatrix(); }
      multiply() { return new DOMMatrix(); }
      translate() { return new DOMMatrix(); }
      scale() { return new DOMMatrix(); }
      rotate() { return new DOMMatrix(); }
      transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
    } as any;
  }

  if (typeof globalThis.Path2D === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.Path2D = class Path2D { constructor() {} } as any;
  }

  if (typeof globalThis.ImageData === "undefined") {
    globalThis.ImageData = class ImageData {
      width: number;
      height: number;
      data: Uint8ClampedArray;
      constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.data = new Uint8ClampedArray(w * h * 4);
      }
    } as any;
  }
}
