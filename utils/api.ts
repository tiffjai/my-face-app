import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

export const createApi = () => {
  const modifyFace = useMutation({
    mutationFn: async (data: { image: string }) => {
      const response = await axios.post('/api/modify-face', data);
      return response.data;
    },
  });

  return { modifyFace };
};
