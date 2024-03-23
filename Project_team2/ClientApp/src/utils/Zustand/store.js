import create from "zustand";

const store = create((set, get) => ({
  user: null,
  token: null,
  isLoggined: false,
  isBlocked: false,
  webSocketToken:null,

  setData: (data) => set(data),
  updateData: (data) => set({...get(),...data}),
  updateUser: (user) => set({  ...get(), user, }),
  setToken: (token) => set({ token }),
  setwebSocketToken: (webSocketToken) => set({ webSocketToken }),
  login: () => set({ isLoggined: true }),
  logout: () => set({ isLoggined: false, token:"", user:null, isBlocked:false, webSocketToken:null, }),
  blockUser: () => set({ isBlocked: true }),
  unblockUser: () => set({ isBlocked: false }),

  initializeFromLocalStorage: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedisLoggined = localStorage.getItem("isLoggined");
    const storedIsBlocked = localStorage.getItem("isBlocked");
    const webSocketToken = localStorage.getItem("webSocketToken");

    set({
      user: JSON.parse(storedUser),
      token: storedToken,
      isLoggined: JSON.parse(storedisLoggined),
      isBlocked: JSON.parse(storedIsBlocked),
      webSocketToken
    });
  },

  persistToLocalStorage: () => {
    const { user, token, isLoggined, isBlocked, webSocketToken } = get();
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("isLoggined", JSON.stringify(isLoggined));
    localStorage.setItem("isBlocked", JSON.stringify(isBlocked));
    localStorage.setItem("webSocketToken", JSON.stringify(webSocketToken));
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
