# UI Components Documentation

This project uses [shadcn/ui](https://ui.shadcn.com/) components, which are built on top of Radix UI primitives and styled with Tailwind CSS. These components provide a consistent, accessible, and customizable design system.

## Components Overview

### Alert Component
```typescript
import { Alert, AlertDescription } from "@/components/ui/alert"
```
Used for displaying error messages and important notifications. Supports different variants:
- `default`: Informational alerts
- `destructive`: Error messages
- `success`: Success messages

### Button Component
```typescript
import { Button } from "@/components/ui/button"
```
Versatile button component with multiple variants and sizes:
- Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Sizes: `default`, `sm`, `lg`
- Support for icons and loading states

### Card Component
```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
```
Container component for organizing content:
- `Card`: Main wrapper
- `CardHeader`: Header section with title and description
- `CardContent`: Main content area
- `CardDescription`: Subtitle or description text
- `CardTitle`: Main heading

### Input Component
```typescript
import { Input } from "@/components/ui/input"
```
Enhanced input component with:
- File upload support
- Custom styling
- Error state handling
- Accessibility features

### Progress Component
```typescript
import { Progress } from "@/components/ui/progress"
```
Progress indicator for:
- Loading states
- Upload progress
- Process completion
- Supports custom values and animations

### Slider Component
```typescript
import { Slider } from "@/components/ui/slider"
```
Interactive slider for value selection:
- Custom min/max values
- Step increments
- Real-time value updates
- Accessible keyboard controls

## Usage in Project

### Image Upload Interface
```typescript
<Card>
  <CardHeader>
    <CardTitle>Upload Portrait</CardTitle>
    <CardDescription>Select an image to begin</CardDescription>
  </CardHeader>
  <CardContent>
    <Input
      type="file"
      accept="image/*"
      className="hidden"
      id="image-upload"
    />
  </CardContent>
</Card>
```

### Image Modification Controls
```typescript
<Slider
  min={0.5}
  max={2}
  step={0.1}
  value={[value]}
  onValueChange={handleChange}
/>
```

### Status Feedback
```typescript
{/* Loading State */}
<Progress value={33} className="w-[60%]" />

{/* Error State */}
<Alert variant="destructive">
  <AlertDescription>{error}</AlertDescription>
</Alert>
```

## Styling

### Global Styles
The components use Tailwind CSS with a custom theme configuration:
- Custom color palette
- Consistent spacing
- Typography scale
- Animation presets

### Component Customization
Components can be customized using:
- Tailwind CSS classes
- CSS variables for theming
- Custom variants
- Style overrides

Example:
```typescript
<Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
  {/* Content */}
</Card>
```

## Best Practices

1. **Consistency**
   - Use provided variants instead of custom styles when possible
   - Maintain consistent spacing using the provided utilities
   - Follow the established color scheme

2. **Accessibility**
   - Include proper ARIA labels
   - Maintain keyboard navigation
   - Use semantic HTML structure
   - Provide proper contrast ratios

3. **Responsive Design**
   - Use responsive class variants
   - Test components at different breakpoints
   - Ensure mobile-friendly interactions

4. **Performance**
   - Import components individually
   - Use dynamic imports for large components
   - Optimize animations and transitions

## Component Dependencies

Each component has specific dependencies that are managed through the project's package.json:

```json
{
  "@radix-ui/react-progress": "^1.1.1",
  "@radix-ui/react-slider": "^1.2.2",
  "@radix-ui/react-slot": "^1.1.1",
  "@shadcn/ui": "^0.0.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "tailwindcss-animate": "^1.0.7"
}
```

## Theme Customization

The project uses a custom theme configuration in `tailwind.config.js`:

- Custom colors for consistent branding
- Extended animation configurations
- Custom border radius values
- Typography scale
- Spacing scale

Components automatically use these theme values for consistent styling across the application.

## Error Handling

Components include built-in error handling:

```typescript
// Input with error state
<Input
  error={Boolean(error)}
  aria-invalid={Boolean(error)}
  aria-describedby={error ? "error-message" : undefined}
/>

// Error display
<Alert variant="destructive">
  <AlertDescription id="error-message">{error}</AlertDescription>
</Alert>
```

## Accessibility Features

All components follow WCAG guidelines:

- Proper focus management
- Keyboard navigation support
- Screen reader announcements
- Sufficient color contrast
- ARIA attributes and roles

## Future Considerations

1. **Component Extensions**
   - Custom variants for specific use cases
   - Additional animation options
   - Extended theme configurations

2. **Performance Optimizations**
   - Code splitting strategies
   - Lazy loading patterns
   - Bundle size optimization

3. **Documentation**
   - Component playground
   - Interactive examples
   - Pattern library
