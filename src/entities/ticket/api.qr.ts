import {AxiosError} from 'axios';
import {request} from '../../shared/api';

export const downloadQRCodes = async (
  params: { prefix: string; part: number; quantity: number },
  token?: string
): Promise<{ blob: Blob; filename: string } | AxiosError> => {
  try {
    const response = await request.get('/tickets/generate_qr_code', {
      params,
      responseType: 'blob',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: 'application/json',
      },
    });
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'qr_codes.zip';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\s*=\s*"?([^";\s]+)"?/i);
      if (match) filename = match[1];
    }
    return { blob: response.data, filename };
  } catch (err) {
    return err as AxiosError;
  }
};
