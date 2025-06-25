import {AxiosError, AxiosResponse} from 'axios'

import { request } from '../../shared/api'

export const getTicketList = async (params: URLSearchParams): Promise<AxiosResponse | AxiosError> =>
  request.get('/tickets/list', { params })

export const createTicket = async (data: Partial<Record<string, unknown>>): Promise<AxiosResponse | AxiosError> =>
  request.post('/tickets/add', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const updateTicket = async (id: number, data: Partial<Record<string, unknown>>): Promise<AxiosResponse | AxiosError> =>
  request.put(`/tickets/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const deleteTicket = async (id: number): Promise<AxiosResponse | AxiosError> =>
  request.delete(`/tickets/${id}`)
