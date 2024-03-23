import { create } from 'zustand'

const store = create((set) => ({
  user:{},
  isLoggined:false,
  token:"",
  setData: (data) => set((state) => ({ ...data})),
}))

export default store;