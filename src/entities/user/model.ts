import axios from 'axios'
import { create } from 'zustand'
import { t } from 'i18next'

import { LOCALSTORAGE_SESSION_KEY } from '../../shared/configs/constants'

import { userAuth } from './api'

import type { AuthResponseData } from './types'

export interface IUserStore {
    session: AuthResponseData | null,
    setSession: (session: AuthResponseData) => void,

    login: (values: object) => void,
    logout: (session: AuthResponseData | null) => void,
    loginRedirect: string,
    isLoggedIn: boolean,
}

export const useUserStore = create<IUserStore>((set, get) => ({
  session: JSON.parse(localStorage.getItem(LOCALSTORAGE_SESSION_KEY)!) ?? null,

  setSession: (session) => {
    localStorage.setItem(LOCALSTORAGE_SESSION_KEY, JSON.stringify(session))
    set({ session: session })

    set({ isLoggedIn: true })
  },

  login: async (values) => {
    try {
      const response = await userAuth(values)

      if (!axios.isAxiosError(response)) {
        const session = response?.data

        if (!axios.isAxiosError(session) && session) get().setSession(session)
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
    localStorage.removeItem(LOCALSTORAGE_SESSION_KEY)
    set({ session: null })
    set({ isLoggedIn: false })
  },
  loginRedirect: '/',
  isLoggedIn: !!localStorage.getItem(LOCALSTORAGE_SESSION_KEY),
}))
