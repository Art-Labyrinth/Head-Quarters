import axios from 'axios'
import { create } from 'zustand'

import { getVolunteerList } from './api.ts'
import {Volunteer} from "./types.ts";

export type VolunteerListStore = {
  list: Volunteer[] | null,
  listError: null,
  listLoading: boolean,

  getList: (search: URLSearchParams) => Promise<void>
}

export const useVolunteerListStore = create<VolunteerListStore>((set) => ({
  list: null,
  listError: null,
  listLoading: false,

  getList: async (search) => {
    try {
      set({ list: null })
      set({ listError: null })
      set({ listLoading: true })

      const response = await getVolunteerList(search)

      if (!axios.isAxiosError(response)) {
        set({ list: response.data })
      }
    } catch (error) {
      let errorText = "Unknown error"

      if (axios.isAxiosError(error)) {
        set({ listError: error.response?.data.detail || errorText })
        errorText = error.response?.data.detail
      }

      throw errorText
    } finally {
      set({ listLoading: false })
    }
  },
}))
