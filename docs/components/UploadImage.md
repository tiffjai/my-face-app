# UploadImage Component Documentation

The `UploadImage` component provides a user interface for uploading and previewing images, with built-in face detection capabilities. It uses shadcn/ui components for a consistent design language.

## Component Overview

```typescript
import { UploadImage } from '@/components/UploadImage';

// Usage
<UploadImage setImage={handleImageUpdate} />
```

## Props

| Prop      | Type                                              | Required | Description                                    |
|-----------|---------------------------------------------------|----------|------------------------------------------------|
| `setImage` | `React.Dispatch<React.SetStateAction<string \| null>>` | Yes      | Callback function to update parent component with the uploaded image data |

## Features

- Drag and drop image upload
- File browser option
- Image preview
- Face detection processing
- Loading states with progress indicator
- Error handling with user feedback
- Side-by-side original and modified image preview

## State Management

The component manages several pieces of state:

```typescript
const [image, setLocalImage] = useState<string | null>(null);
const [modifiedImage, setModifiedImage] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## Main Functions

### `handleImageChange`

```typescript
const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    if (e.target?.result) {
      const imageData = e.target.result as string;
      setLocalImage(imageData);
      setImage(imageData);
      try {
        setIsLoading(true);
        setError(null);
        const response = await modifyFace.mutateAsync({ 
          image: imageData,
          eyeSize: 1,
          faceSize: 1
        });
        setModifiedImage(response);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };
  reader.readAsDataURL(file);
};
```

This function:
- Handles file input changes
- Converts uploaded file to base64
- Updates local and parent state
- Initiates face detection
- Manages loading and error states

## UI Components

### Card Layout

```typescript
<Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
  <CardHeader>
    <CardTitle>Upload Portrait</CardTitle>
    <CardDescription>Select an image to begin the transformation</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Upload area and previews */}
  </CardContent>
</Card>
```

### Upload Area

```typescript
<div className="space-y-4">
  <div className="flex flex-col items-center justify-center w-full h-40 cursor-pointer group">
    <Input
      type="file"
      onChange={handleImageChange}
      accept="image/*"
      className="hidden"
      id="image-upload"
    />
    <label 
      htmlFor="image-upload" 
      className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-accent/20 hover:bg-accent/30 transition-colors duration-300 cursor-pointer"
    >
      <svg className="w-8 h-8 text-muted-foreground mb-4" /* ... */ />
      <p className="text-sm text-muted-foreground mb-1">Drag and drop your image here</p>
      <p className="text-xs text-muted-foreground">or click to browse</p>
    </label>
  </div>
</div>
```

### Image Preview Grid

The component displays original and modified images side by side when available:

```typescript
<div className="grid grid-cols-2 gap-8">
  {/* Original Image */}
  <div className="space-y-3">
    <h3 className="text-sm font-medium">Original</h3>
    <div className="relative rounded-lg overflow-hidden bg-accent/20">
      <img src={image} alt="Original Image" className="w-full h-auto object-contain" />
    </div>
  </div>
  
  {/* Modified Image */}
  <div className="space-y-3">
    <h3 className="text-sm font-medium">Modified</h3>
    {/* Different states: modified, loading, error, or empty */}
  </div>
</div>
```

### Status Displays

1. **Loading State**
```typescript
<div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-accent/20 rounded-lg space-y-4">
  <Progress value={33} className="w-[60%]" />
  <p className="text-sm text-muted-foreground">Processing...</p>
</div>
```

2. **Error State**
```typescript
<Alert variant="destructive">
  <AlertDescription>No face detected in the image</AlertDescription>
</Alert>
```

3. **Empty State**
```typescript
<div className="flex items-center justify-center h-full min-h-[200px] bg-accent/20 rounded-lg">
  <p className="text-muted-foreground">Upload an image to see the magic</p>
</div>
```

## Styling

The component uses:
- Tailwind CSS for styling
- shadcn/ui components for consistent design
- Responsive grid layout
- Semi-transparent backgrounds with backdrop blur
- Hover and transition effects for interactive elements

## Dependencies

- `@/components/ui/card`: Card components for layout
- `@/components/ui/alert`: Alert component for error display
- `@/components/ui/progress`: Progress indicator
- `@/components/ui/input`: Hidden file input
- `@/utils/api`: API utilities for face modification

## Best Practices

1. **File Handling**
   - Accepts only image files
   - Proper file reading and conversion
   - Error handling for file operations

2. **User Experience**
   - Clear upload instructions
   - Visual feedback for drag and drop
   - Immediate preview of uploaded image
   - Loading states during processing

3. **Error Handling**
   - Specific error messages for different scenarios
   - Visual error states
   - Graceful fallbacks

4. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation support
   - Clear visual hierarchy
   - Alternative text for images

## Example Usage

```typescript
import { UploadImage } from '@/components/UploadImage';

function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      <UploadImage setImage={setCurrentImage} />
      {currentImage && (
        <div className="mt-4">
          {/* Additional components that use the uploaded image */}
        </div>
      )}
    </div>
  );
}
