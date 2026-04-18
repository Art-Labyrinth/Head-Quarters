import {AxiosError} from 'axios';
import {request} from '../../shared/api';

type DownloadFileResponse = {
  blob: Blob;
  filename: string;
};

type ExistingTicketsRequest = {
  ids?: number[];
  ticket_ids?: string[];
  range_from?: number;
  range_to?: number;
  for_print?: boolean;
};

const getFilenameFromHeaders = (contentDisposition?: string, fallback = 'download.zip') => {
  if (!contentDisposition) return fallback;

  const match = contentDisposition.match(/filename\s*=\s*"?([^";\s]+)"?/i);

  return match?.[1] ?? fallback;
};

export const downloadQRCodes = async (
  params: { prefix: string; part: number; quantity: number },
  token?: string
): Promise<DownloadFileResponse | AxiosError> => {
  try {
    const response = await request.get('/tickets/generate_qr_code', {
      params,
      responseType: 'blob',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: 'application/json',
      },
    });

    return {
      blob: response.data,
      filename: getFilenameFromHeaders(response.headers['content-disposition'], 'qr_codes.zip'),
    };
  } catch (err) {
    return err as AxiosError;
  }
};

export const downloadExistingTickets = async (
  payload: ExistingTicketsRequest,
  token?: string
): Promise<DownloadFileResponse | AxiosError> => {
  try {
    const response = await request.post('/tickets/download_existing_tickets', payload, {
      responseType: 'blob',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: 'application/json',
      },
    });

    return {
      blob: response.data,
      filename: getFilenameFromHeaders(response.headers['content-disposition'], 'tickets_archive.zip'),
    };
  } catch (err) {
    return err as AxiosError;
  }
};
