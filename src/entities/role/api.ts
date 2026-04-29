import {AxiosError, AxiosResponse} from 'axios'
import {request} from '../../shared/api'
import type {PermissionSchema, Role, RoleCreatePayload} from './types'

export const getRoles = async (params?: URLSearchParams): Promise<AxiosResponse<Role[]> | AxiosError> =>
  request.get('/roles/list', { params })

export const getRole = async (id: number): Promise<AxiosResponse<Role> | AxiosError> =>
  request.get(`/roles/${id}`)

export const createRole = async (data: RoleCreatePayload): Promise<AxiosResponse<Role> | AxiosError> =>
  request.post('/roles/add', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const updateRole = async (id: number, data: Partial<RoleCreatePayload>): Promise<AxiosResponse<Role> | AxiosError> =>
  request.put(`/roles/${id}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const getPermissionsSchema = async (): Promise<AxiosResponse<PermissionSchema> | AxiosError> =>
  request.get('/permissions/schema')

export const deleteRole = async (id: number): Promise<AxiosResponse | AxiosError> =>
  request.delete(`/roles/${id}`)
