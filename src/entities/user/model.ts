import axios from 'axios'
import { create } from 'zustand'
import { t } from 'i18next'

import {
  LOCALSTORAGE_ROLE_KEY,
  LOCALSTORAGE_SESSION_KEY,
  LOCALSTORAGE_USERNAME_KEY
} from '../../shared/configs/constants'

import { userAuth } from './api'

import type { AuthResponseData } from './types'

export interface IUserStore {
    role: AuthResponseData['role'] | null,
    username: AuthResponseData['username'] | null,
    session: AuthResponseData['access_token'] | null,
    setSession: (session: AuthResponseData) => void,

    login: (values: object) => void,
    logout: (session: AuthResponseData | null) => void,
    loginRedirect: string,
    isLoggedIn: boolean,
}

export const useUserStore = create<IUserStore>((set, get) => ({
  role: JSON.parse(localStorage.getItem(LOCALSTORAGE_ROLE_KEY)!) ?? null,
  username: JSON.parse(localStorage.getItem(LOCALSTORAGE_USERNAME_KEY)!) ?? null,
  session: JSON.parse(localStorage.getItem(LOCALSTORAGE_SESSION_KEY)!) ?? null,

  setSession: (session) => {
    localStorage.setItem(LOCALSTORAGE_ROLE_KEY, JSON.stringify(session.role))
    set({ role: session.role })

    localStorage.setItem(LOCALSTORAGE_USERNAME_KEY, JSON.stringify(session.username))
    set({ username: session.username })

    localStorage.setItem(LOCALSTORAGE_SESSION_KEY, JSON.stringify(session.access_token))
    set({ session: session.access_token })

    set({ isLoggedIn: true })
  },

  login: async (values) => {
    try {
      const response = await userAuth(values)

      if (!axios.isAxiosError(response)) {
        const session = response?.data

        if (!axios.isAxiosError(session) && session) {
          get().setSession(session)
        }
      }
    } catch (error) {
      let errorText = t('global:Unknown error')

      if (axios.isAxiosError(error)) {
        errorText = error.response?.data.message
      }

      throw errorText
    }
  },

  logout: () => {
    localStorage.removeItem(LOCALSTORAGE_ROLE_KEY)
    set({ role: null })

    localStorage.removeItem(LOCALSTORAGE_USERNAME_KEY)
    set({ username: null })

    localStorage.removeItem(LOCALSTORAGE_SESSION_KEY)
    set({ session: null })

    set({ isLoggedIn: false })
  },
  loginRedirect: '/',
  isLoggedIn: !!localStorage.getItem(LOCALSTORAGE_SESSION_KEY),
}))
