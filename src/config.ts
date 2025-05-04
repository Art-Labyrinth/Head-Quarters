const isDev = import.meta.env.MODE === 'development';

export const API_URL_PREFIX = isDev ? 'http://localhost:8000/' : '/api/v1/';