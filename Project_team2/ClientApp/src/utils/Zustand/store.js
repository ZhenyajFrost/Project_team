import create from "zustand";

const store = create((set, get) => ({
  user: null,
  token: null,
  isLoggined: false,
  isBlocked: false,

  setData: (data) => set(data),
  updateUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  login: () => set({ isLoggined: true }),
  logout: () => set({ isLoggined: false, token:"", user:null, isBlocked:false }),
  blockUser: () => set({ isBlocked: true }),
  unblockUser: () => set({ isBlocked: false }),

  initializeFromLocalStorage: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedisLoggined = localStorage.getItem("isLoggined");
    const storedIsBlocked = localStorage.getItem("isBlocked");

    set({
      user: JSON.parse(storedUser),
      token: storedToken,
      isLoggined: JSON.parse(storedisLoggined),
      isBlocked: JSON.parse(storedIsBlocked),
    });
  },

  persistToLocalStorage: () => {
    const { user, token, isLoggined, isBlocked } = get();
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("isLoggined", JSON.stringify(isLoggined));
    localStorage.setItem("isBlocked", JSON.stringify(isBlocked));
  },
  clearAllData: () => {
    localStorage.clear();
    set({
      user: null,
      token: null,
      isLoggined: false,
      isBlocked: false,
    });
  },
}));

store.getState().initializeFromLocalStorage();

store.subscribe((state) => state.persistToLocalStorage());

export default store;
