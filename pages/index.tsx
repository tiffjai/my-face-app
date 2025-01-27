import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import UploadImage from '../components/UploadImage';
import ImageModifier from '../components/ImageModifier';

const queryClient = new QueryClient();

const Home: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(
        <QueryClientProvider client={queryClient}>
          <HomeContent />
        </QueryClientProvider>
      );
    }
  }, []);

  return <div id="root"></div>;
};

const HomeContent: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);

  return (
    <div>
      <h1>Modify Your Image</h1>
      <UploadImage setImage={setImage} />
      {image && <ImageModifier image={image} />}
    </div>
  );
};

export default Home;
