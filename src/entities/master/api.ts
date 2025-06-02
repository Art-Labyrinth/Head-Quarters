import {AxiosError, AxiosResponse} from 'axios'

import { request } from '../../shared/api'

export const getMasterList = async (params: URLSearchParams): Promise<AxiosResponse | AxiosError> =>
  request.get('/masters/list', { params })

export const getMaster = async (id: number): Promise<AxiosResponse | AxiosError> =>
  request.get(`/masters/${id}`)

export const createMaster = async (data: FormData): Promise<AxiosResponse | AxiosError> =>
  request.post('/masters/create', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

export const updateMaster = async (id: string, data: FormData): Promise<AxiosResponse | AxiosError> =>
  request.put(`/masters/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  export const deleteMaster = async (id: string): Promise<AxiosResponse | AxiosError> =>
  request.delete(`/masters/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
