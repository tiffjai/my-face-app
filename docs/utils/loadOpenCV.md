# OpenCV Loading Utility Documentation

The `loadOpenCV` utility provides a consistent way to load OpenCV.js in both browser and server environments. This utility is crucial for the application's face detection and image processing capabilities.

## Function Overview

```typescript
export async function loadOpenCV(): Promise<any>
```

The function returns a Promise that resolves to the OpenCV instance (`cv`) when successfully loaded.

## Implementation Details

### Browser Environment

In the browser, the utility:
1. Checks if OpenCV is already loaded
2. If not, dynamically injects the OpenCV.js script
3. Returns a promise that resolves when loading is complete

```typescript
// Browser implementation
if (typeof window !== 'undefined') {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).cv) {
      resolve((window as any).cv);
      return;
    }

    // Dynamically load OpenCV
    const script = document.createElement('script');
    script.src = '/opencv.js';
    script.onload = () => {
      if ((window as any).cv) {
        resolve((window as any).cv);
      } else {
        reject(new Error('OpenCV not loaded'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load OpenCV'));
    document.head.appendChild(script);
  });
}
```

### Server Environment

In Node.js, the utility:
1. Attempts to require the OpenCV.js file
2. Returns a promise that resolves with the loaded module

```typescript
// Server implementation
return new Promise((resolve, reject) => {
  try {
    const cv = require('/public/opencv.js');
    resolve(cv);
  } catch (error) {
    console.error('Failed to load OpenCV:', error);
    reject(error);
  }
});
```

## Usage

### Basic Usage

```typescript
import { loadOpenCV } from '@/utils/loadOpenCV';

async function processImage() {
  try {
    const cv = await loadOpenCV();
    // Use OpenCV functions
    const mat = new cv.Mat();
    // ... process image
  } catch (error) {
    console.error('Failed to load OpenCV:', error);
  }
}
```

### With Error Handling

```typescript
import { loadOpenCV } from '@/utils/loadOpenCV';

async function initializeImageProcessing() {
  try {
    const cv = await loadOpenCV();
    console.log('OpenCV loaded successfully');
    return cv;
  } catch (error) {
    console.error('Error loading OpenCV:', error);
    // Handle the error appropriately
    throw new Error('Image processing initialization failed');
  }
}
```

## Error Handling

The utility handles several error cases:

1. **Browser Environment**
   - Script loading failure
   - OpenCV not properly initialized
   - Network errors

2. **Server Environment**
   - Module loading failure
   - File not found
   - Invalid OpenCV.js file

## Best Practices

1. **Loading Strategy**
   ```typescript
   // Load early in your application
   useEffect(() => {
     loadOpenCV()
       .then(cv => {
         // Store cv instance or initialize processing
       })
       .catch(error => {
         // Handle error appropriately
       });
   }, []);
   ```

2. **Error Recovery**
   ```typescript
   let retryCount = 0;
   const maxRetries = 3;

   async function loadOpenCVWithRetry() {
     try {
       return await loadOpenCV();
     } catch (error) {
       if (retryCount < maxRetries) {
         retryCount++;
         console.log(`Retrying OpenCV load (${retryCount}/${maxRetries})`);
         return loadOpenCVWithRetry();
       }
       throw error;
     }
   }
   ```

3. **Environment Check**
   ```typescript
   async function initializeCV() {
     if (typeof window === 'undefined') {
       console.log('Server-side OpenCV initialization');
     } else {
       console.log('Client-side OpenCV initialization');
     }
     return loadOpenCV();
   }
   ```

## Performance Considerations

1. **Loading Time**
   - OpenCV.js is a large file (~8MB)
   - Consider loading it asynchronously
   - Implement loading indicators for user feedback

2. **Caching**
   - Browser will cache the OpenCV.js file
   - Subsequent loads will be faster
   - Consider implementing version control for updates

3. **Memory Management**
   ```typescript
   async function processWithOpenCV() {
     const cv = await loadOpenCV();
     try {
       // Create OpenCV objects
       const mat = new cv.Mat();
       // Process image
       // ... 
       return result;
     } finally {
       // Clean up OpenCV objects
       mat.delete();
     }
   }
   ```

## Security Considerations

1. **Script Source**
   - OpenCV.js is served from your domain
   - Ensure file integrity
   - Consider implementing SRI (Subresource Integrity)

2. **Error Messages**
   - Sanitize error messages before displaying to users
   - Log detailed errors server-side
   - Provide user-friendly error messages

## Dependencies

- OpenCV.js file in public directory
- TypeScript for type definitions
- Next.js for serving static files

## Related Files

- `/public/opencv.js` - The OpenCV.js library file
- `/types/opencv.d.ts` - TypeScript definitions for OpenCV
- Components using OpenCV (ImageModifier, etc.)

## Future Improvements

1. **Loading Optimization**
   - Implement progressive loading
   - Add WebAssembly support
   - Optimize file size

2. **Error Handling**
   - Add detailed error types
   - Implement retry mechanisms
   - Add telemetry for loading failures

3. **Type Safety**
   - Improve TypeScript definitions
   - Add runtime type checking
   - Enhance error type definitions
