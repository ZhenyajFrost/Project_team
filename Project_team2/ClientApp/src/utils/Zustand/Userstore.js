import create from "zustand";
const Userstore = create((set) => ({
    user: {},
    toke:"",
    isLoggined: false,
    setUser: (user) => set(() => ({ user })),
    setToken: (token) => set(() => ({ token })),
    setIsLoggined: (isLoggined) => set(() => ({ isLoggined })),
  }));

  export default Userstore