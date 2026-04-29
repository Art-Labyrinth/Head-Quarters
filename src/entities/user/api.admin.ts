import {AxiosError, AxiosResponse} from 'axios'
import {request} from '../../shared/api'

export const getUsers = async (params?: URLSearchParams): Promise<AxiosResponse | AxiosError> =>
  request.get('/users/list', { params })

export const getUser = async (id: number): Promise<AxiosResponse | AxiosError> =>
  request.get(`/users/${id}`)

export const createUser = async (data: Partial<Record<string, unknown>>): Promise<AxiosResponse | AxiosError> =>
  request.post('/users/add', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const updateUser = async (id: number, data: Partial<Record<string, unknown>>): Promise<AxiosResponse | AxiosError> =>
  request.put(`/users/${id}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const deleteUser = async (id: number): Promise<AxiosResponse | AxiosError> =>
  request.delete(`/users/${id}`)
