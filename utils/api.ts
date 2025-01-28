import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

const API_URL = 'https://my-face-app.onrender.com';

export const createApi = () => {
  const modifyFace = useMutation({
    mutationFn: async (data: { image: string, eyeSize?: number, faceSize?: number }) => {
      const response = await axios.post(`${API_URL}/api/modify-face`, data);
      return response.data;
    },
  });

  return { modifyFace };
};
