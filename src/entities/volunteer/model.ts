import axios from 'axios'
import { create } from 'zustand'

import { getVolunteerList } from './api.ts'
import {DataItem} from "./types.ts";

export type VolunteerListStore = {
  list: DataItem[] | null,
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
      console.log(response)

      if (!axios.isAxiosError(response)) {
        set({ list: response.data })
      }
    } catch (error) {
      let errorText = "Unknown error"

      if (axios.isAxiosError(error)) {
        set({ listError: error.response?.data.message || errorText })
        errorText = error.response?.data.message
      }

      throw errorText
    } finally {
      set({ listLoading: false })
    }
  },
}))
