# My Face App

A Next.js application for face detection and modification using TensorFlow.js and OpenCV.

## Features

- Upload images for face detection
- Real-time face modification capabilities
- Interactive UI controls for adjustments
- Built with modern web technologies

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org)
- **UI Components**: 
  - [Radix UI](https://www.radix-ui.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Face Detection**: 
  - [TensorFlow.js](https://www.tensorflow.org/js)
  - [Human](https://github.com/vladmandic/human)
  - [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)
- **Image Processing**: 
  - [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
  - [image-js](https://image-js.github.io/image-js/)

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/components` - React components
  - `/ui` - Reusable UI components
  - `ImageModifier.tsx` - Main component for image modification
  - `UploadImage.tsx` - Component for image upload handling
- `/pages` - Next.js pages and API routes
- `/public` - Static assets
- `/types` - TypeScript type definitions
- `/utils` - Utility functions and API helpers

## Development

The application uses several key technologies:

- **TensorFlow.js** for machine learning operations
- **OpenCV.js** for image processing
- **Human library** for face detection and recognition
- **Next.js API Routes** for server-side processing
- **React Query** for efficient data fetching
- **Tailwind CSS** for styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
