import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import UploadImage from '../components/UploadImage';
import ImageModifier from '../components/ImageModifier';

const queryClient = new QueryClient();

const Home: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-accent via-background to-accent/50">
        <div className="max-w-6xl mx-auto px-6 py-8 h-full overflow-y-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-primary mb-6">
              Face <span className="font-normal bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">Modifier</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
              Transform your portraits with precision and elegance. 
              Experience professional-grade facial modifications powered by advanced AI.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <UploadImage setImage={setImage} />
            {image && (
              <div className="transition-all duration-700 ease-in-out transform">
                <ImageModifier image={image} />
              </div>
            )}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default Home;
