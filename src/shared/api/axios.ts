import axios from 'axios'

import { useUserStore } from '../../entities/user'
import {
  LOCALSTORAGE_SESSION_KEY,
  LOCALSTORAGE_TRANSLATION_KEY,
    VITE_API_URL_PREFIX,
} from '../configs/constants'

export const request = axios.create({
  baseURL: VITE_API_URL_PREFIX,
  responseType: 'json',
})

request.interceptors.request.use(
  (config) => {
    const session = JSON.parse(localStorage.getItem(LOCALSTORAGE_SESSION_KEY)!)

    if (session?.access_token) {
      config.headers.authorization = `Bearer ${session?.access_token}`
    }

    config.headers['Accept-Language'] = localStorage.getItem(LOCALSTORAGE_TRANSLATION_KEY)

    return config
  },
  (error) => {
    console.log(error)

    return Promise.reject(error.response)
  },
)

request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.log(error)

    if (error.response.status === 401) {
      const session = JSON.parse(localStorage.getItem(LOCALSTORAGE_SESSION_KEY)!) ?? null
      useUserStore.getState().logout(session)
    }

    return Promise.reject(error)
  },
)

export const requestFile = axios.create({
  baseURL: VITE_API_URL_PREFIX,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})
requestFile.interceptors.request.use(
  (config) => {
    const session = JSON.parse(localStorage.getItem(LOCALSTORAGE_SESSION_KEY)!)

    if (session?.access_token) {
      config.headers.authorization = `Bearer ${session?.access_token}`
    }

    config.headers['Accept-Language'] = localStorage.getItem(LOCALSTORAGE_TRANSLATION_KEY)

    return config
  },
  (error) => {
    console.log(error)

    return Promise.reject(error.response)
  },
)

requestFile.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.log(error)

    if (error.response.status === 401) {
      const session = JSON.parse(localStorage.getItem(LOCALSTORAGE_SESSION_KEY)!) ?? null
      useUserStore.getState().logout(session)
    }

    return Promise.reject(error)
  },
)
