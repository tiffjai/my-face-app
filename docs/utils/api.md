# API Utilities Documentation

The API utilities provide a clean interface for making API requests using React Query and Axios. This module currently focuses on face modification functionality.

## Overview

```typescript
import { createApi } from '@/utils/api';

// Usage
const { modifyFace } = createApi();
```

## API Factory Function

### `createApi()`

Returns an object containing API mutation hooks for different endpoints.

```typescript
export const createApi = () => {
  // ... mutation definitions
  return { modifyFace };
};
```

## Available Mutations

### `modifyFace`

A React Query mutation for modifying face features in images.

#### Type Definition

```typescript
interface ModifyFaceData {
  image: string;      // Base64 encoded image
  eyeSize?: number;   // Optional eye size multiplier (0.5-2)
  faceSize?: number;  // Optional face size multiplier (0.5-2)
}

interface ModifyFaceMutation {
  mutateAsync: (data: ModifyFaceData) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
  // ... other React Query mutation properties
}
```

#### Usage Example

```typescript
function ImageEditor() {
  const { modifyFace } = createApi();

  const handleModification = async () => {
    try {
      const modifiedImage = await modifyFace.mutateAsync({
        image: base64Image,
        eyeSize: 1.2,
        faceSize: 1.0
      });
      // Handle the modified image
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {modifyFace.isLoading && <LoadingSpinner />}
      {modifyFace.error && <ErrorMessage error={modifyFace.error} />}
      <button onClick={handleModification}>Modify Image</button>
    </div>
  );
}
```

## Implementation Details

### React Query Integration

The utility uses React Query's `useMutation` hook for managing server state:

```typescript
const modifyFace = useMutation({
  mutationFn: async (data: ModifyFaceData) => {
    const response = await axios.post('/api/modify-face', data);
    return response.data;
  },
});
```

Benefits:
- Automatic loading states
- Error handling
- Request deduplication
- Retry logic
- Cache management

### Axios Configuration

The utility uses Axios for making HTTP requests:
- POST requests to `/api/modify-face`
- Automatic handling of JSON data
- Error handling with Axios interceptors

## Error Handling

The mutation provides comprehensive error handling through React Query:

```typescript
function handleError() {
  const { modifyFace } = createApi();

  if (modifyFace.error) {
    if (axios.isAxiosError(modifyFace.error)) {
      // Handle specific HTTP errors
      switch (modifyFace.error.response?.status) {
        case 400:
          return 'Invalid image data';
        case 500:
          return 'Server processing error';
        default:
          return 'Unknown error occurred';
      }
    }
    // Handle other types of errors
    return modifyFace.error.message;
  }
}
```

## Best Practices

1. **Error Handling**
```typescript
const { modifyFace } = createApi();

try {
  await modifyFace.mutateAsync(data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle HTTP errors
  } else {
    // Handle other errors
  }
}
```

2. **Loading States**
```typescript
const { modifyFace } = createApi();

return (
  <div>
    <button 
      disabled={modifyFace.isLoading}
      onClick={() => modifyFace.mutate(data)}
    >
      {modifyFace.isLoading ? 'Processing...' : 'Modify Image'}
    </button>
  </div>
);
```

3. **Type Safety**
```typescript
interface ModifyFaceInput {
  image: string;
  eyeSize?: number;
  faceSize?: number;
}

function validateInput(input: ModifyFaceInput) {
  if (!input.image) {
    throw new Error('Image is required');
  }
  if (input.eyeSize && (input.eyeSize < 0.5 || input.eyeSize > 2)) {
    throw new Error('Eye size must be between 0.5 and 2');
  }
  if (input.faceSize && (input.faceSize < 0.5 || input.faceSize > 2)) {
    throw new Error('Face size must be between 0.5 and 2');
  }
}
```

## Dependencies

- `@tanstack/react-query`: For server state management
- `axios`: For HTTP requests

## Performance Considerations

1. **Request Optimization**
   - Automatic request deduplication
   - Caching of responses
   - Retry logic for failed requests

2. **Memory Management**
   - Proper cleanup of resources
   - Handling of large base64 strings

3. **Error Recovery**
   - Automatic retries for failed requests
   - Graceful degradation

## Security Considerations

1. **Data Validation**
   - Validate input data before sending
   - Sanitize error messages
   - Handle sensitive information properly

2. **Error Handling**
   - Don't expose internal errors to users
   - Log errors appropriately
   - Provide user-friendly error messages

## Future Improvements

1. **API Extension**
   - Add more mutation types
   - Implement query hooks
   - Add real-time updates

2. **Type Safety**
   - Enhance TypeScript definitions
   - Add runtime type checking
   - Improve error types

3. **Performance**
   - Implement request queuing
   - Add request cancellation
   - Optimize large payload handling
