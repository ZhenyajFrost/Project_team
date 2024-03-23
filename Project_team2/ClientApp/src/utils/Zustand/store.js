import { create } from 'zustand'

const store = create((set) => ({
  user:{},
  isLoggined:false,
  token:"",
  setData: (data) => set((state) => ({ ...data})),
  updateData: (data) => set((state) => ({...state, ...data})),
  updateUser: (data) => set((state) => ({...state, user:{...state.user, ...data}})),
  
}))

export default store;