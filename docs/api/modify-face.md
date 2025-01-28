# Face Modification API Documentation

This document describes the `/api/modify-face` endpoint, which provides face detection and modification capabilities using TensorFlow.js and the Human library.

## Endpoint Details

- **URL**: `/api/modify-face`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request Body

```typescript
{
  image: string;      // Base64 encoded image data
  eyeSize: number;    // Scale factor for eye size (0.5 to 2)
  faceSize: number;   // Scale factor for face size (0.5 to 2)
}
```

### Parameters

- **image** (required)
  - Type: string (base64)
  - Description: The input image encoded as a base64 string
  - Format: Must be a valid image format (JPEG, PNG)
  - Example: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`

- **eyeSize** (required)
  - Type: number
  - Range: 0.5 to 2
  - Description: Scale factor for eye modification
  - Example: 1.5 (increases eye size by 50%)

- **faceSize** (required)
  - Type: number
  - Range: 0.5 to 2
  - Description: Scale factor for face modification
  - Example: 1.2 (increases face size by 20%)

## Response

### Success Response

- **Code**: 200 OK
- **Content**: Base64 encoded modified image
- **Format**: `data:image/jpeg;base64,{modified_image_data}`

### Error Responses

1. **Invalid Method**
   - Code: 405 Method Not Allowed
   - Content: `{ "error": "Method Not Allowed" }`
   - When: Request method is not POST

2. **Missing Image**
   - Code: 400 Bad Request
   - Content: `{ "error": "No image data provided" }`
   - When: Image data is missing in request body

3. **Invalid Size Values**
   - Code: 400 Bad Request
   - Content: `{ "error": "Invalid size values" }`
   - When: eyeSize or faceSize is out of range (0.5-2)

4. **No Face Detected**
   - Code: 400 Bad Request
   - Content: `{ "error": "No face detected" }`
   - When: No face is detected in the provided image

5. **No Facial Landmarks**
   - Code: 400 Bad Request
   - Content: `{ "error": "No facial landmarks detected" }`
   - When: Face is detected but landmarks cannot be extracted

6. **Server Error**
   - Code: 500 Internal Server Error
   - Content: `{ "error": "Internal Server Error: {error_message}" }`
   - When: Unexpected server-side error occurs

## Implementation Details

### Face Detection Process

1. **Image Preprocessing**
   - Decodes base64 image data
   - Resizes image if larger than 640x480 while maintaining aspect ratio
   - Creates canvas for image manipulation

2. **Face Detection**
   - Uses Human library with TensorFlow.js backend
   - Detects facial features and landmarks
   - Extracts specific facial points:
     - Left/right upper eyelids (points 36-40, 42-46)
     - Left/right lower eyelids (points 40-42, 46-48)
     - Left/right irises (points 474-478, 469-473)

3. **Image Modification**
   - Scales iris size based on eyeSize parameter
   - Adjusts eyelids to match new iris size
   - Maintains natural appearance through gradual scaling

### Performance Considerations

- Image size is limited to 640x480 to optimize processing speed
- Uses TensorFlow.js for efficient face detection
- Implements memory management for tensor operations

## Example Usage

```typescript
const modifyFace = async (imageData: string) => {
  try {
    const response = await fetch('/api/modify-face', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        eyeSize: 1.2,
        faceSize: 1.0
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const modifiedImageData = await response.text();
    return modifiedImageData; // Base64 encoded modified image
  } catch (error) {
    console.error('Error modifying face:', error);
    throw error;
  }
};
```

## Dependencies

- `@vladmandic/human`: Face detection and landmark identification
- `@tensorflow/tfjs-node`: TensorFlow.js backend
- `canvas`: Node.js canvas implementation for image manipulation

## Error Handling

The API implements comprehensive error handling:
- Input validation for image data and size parameters
- Face detection verification
- Facial landmark validation
- Generic error handling with detailed error messages

## Security Considerations

- Input validation prevents malformed requests
- Image size limits prevent memory exploitation
- Error messages are sanitized to prevent information leakage
- Base64 validation ensures proper image format
