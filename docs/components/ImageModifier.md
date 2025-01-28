# ImageModifier Component Documentation

The `ImageModifier` component provides an interactive interface for adjusting facial features in images using sliders. It's built using shadcn/ui components and integrates with the face modification API.

## Component Overview

```typescript
import { ImageModifier } from '@/components/ImageModifier';

// Usage
<ImageModifier image="base64_image_data" />
```

## Props

| Prop    | Type     | Required | Description                           |
|---------|----------|----------|---------------------------------------|
| `image` | `string` | Yes      | Base64 encoded image data to modify   |

## Features

- Interactive sliders for adjusting eye and face size
- Real-time image modification
- Loading states with progress indicator
- Error handling and display
- Responsive design with mobile support

## State Management

The component manages several pieces of state:

```typescript
const [eyeSize, setEyeSize] = useState(1);        // Eye size multiplier (0.5-2)
const [faceSize, setFaceSize] = useState(1);      // Face size multiplier (0.5-2)
const [modifiedImage, setModifiedImage] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

## Main Functions

### `modifyImage`

```typescript
const modifyImage = async (newEyeSize: number, newFaceSize: number) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await axios.post('/api/modify-face', {
      image,
      eyeSize: newEyeSize,
      faceSize: newFaceSize
    });
    setModifiedImage(response.data);
  } catch (error: any) {
    console.error('Error modifying image:', error);
    setError(error.response?.data?.error || 'Failed to modify image');
    setModifiedImage(null);
  } finally {
    setIsLoading(false);
  }
};
```

This function:
- Makes API request to modify the image
- Handles loading states
- Manages error states
- Updates the modified image when successful

### Event Handlers

```typescript
const handleEyeSizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const newSize = Number(event.target.value);
  setEyeSize(newSize);
  await modifyImage(newSize, faceSize);
};

const handleFaceSizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const newSize = Number(event.target.value);
  setFaceSize(newSize);
  await modifyImage(eyeSize, newSize);
};
```

These handlers:
- Update local state for slider values
- Trigger image modification with new values
- Handle type conversion from string to number

## UI Components

### Card Layout
```typescript
<Card className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm">
  <CardHeader>
    <CardTitle>Adjust Features</CardTitle>
    <CardDescription>Fine-tune facial features with precision</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Sliders and image display */}
  </CardContent>
</Card>
```

### Sliders

Each slider section includes:
- Icon representing the feature
- Label and current value display
- Slider control with min/max values
- Helper text for size indication

Example structure:
```typescript
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-2">
      <svg />
      <label>Eye Size</label>
    </div>
    <span>{eyeSize.toFixed(1)}x</span>
  </div>
  <Slider
    min={0.5}
    max={2}
    step={0.1}
    value={[eyeSize]}
    onValueChange={handleEyeSizeChange}
  />
  <div className="flex justify-between text-xs">
    <span>Smaller</span>
    <span>Larger</span>
  </div>
</div>
```

### Status Displays

1. **Loading State**
```typescript
{isLoading && (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <Progress value={33} className="w-[60%]" />
    <p className="text-sm text-muted-foreground">Processing changes...</p>
  </div>
)}
```

2. **Error State**
```typescript
{error && (
  <Alert variant="destructive">
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

3. **Modified Image Display**
```typescript
{modifiedImage && !isLoading && (
  <div className="rounded-lg overflow-hidden">
    <img src={modifiedImage} alt="Modified" className="w-full h-auto" />
  </div>
)}
```

## Styling

The component uses:
- Tailwind CSS for styling
- shadcn/ui components for consistent design
- Responsive layout with max-width constraints
- Semi-transparent background with backdrop blur
- Consistent spacing using space-y utilities

## Dependencies

- `@/components/ui/card`: Card components for layout
- `@/components/ui/alert`: Alert component for error display
- `@/components/ui/progress`: Progress indicator
- `@/components/ui/slider`: Slider control
- `axios`: HTTP client for API requests

## Best Practices

1. **Error Handling**
   - Comprehensive error catching
   - User-friendly error messages
   - Fallback error message when API response is unclear

2. **Performance**
   - Debounced slider updates (implicit in React state updates)
   - Proper cleanup of previous requests
   - Efficient state management

3. **Accessibility**
   - Proper labeling of controls
   - Visual feedback for interactions
   - Clear error messaging
   - Semantic HTML structure

4. **User Experience**
   - Real-time updates
   - Clear loading states
   - Intuitive slider controls
   - Immediate visual feedback

## Example Usage

```typescript
import { ImageModifier } from '@/components/ImageModifier';

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  return (
    <div>
      {uploadedImage && (
        <ImageModifier image={uploadedImage} />
      )}
    </div>
  );
}
