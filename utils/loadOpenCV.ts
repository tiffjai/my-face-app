export async function loadOpenCV(): Promise<any> {
  if (typeof window !== 'undefined') {
    // Browser environment
    return new Promise((resolve, reject) => {
      if ((window as any).cv) {
        resolve((window as any).cv);
        return;
      }

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
  } else {
    // Server environment
    return new Promise((resolve, reject) => {
      try {
        const cv = require('/public/opencv.js');
        resolve(cv);
      } catch (error) {
        console.error('Failed to load OpenCV:', error);
        reject(error);
      }
    });
  }
}
