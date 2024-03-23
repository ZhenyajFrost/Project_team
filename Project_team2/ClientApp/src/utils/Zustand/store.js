import create from "zustand";
import { WS_BASE_URL } from "../../API/apiConstant";

const store = create((set, get) => ({
  user: null,
  token: null,
  isLoggined: false,
  isBlocked: false,
  webSocketToken: null,
  webSocket: null,

  setData: (data) => set(data),
  updateData: (data) => set({...get(),...data}),
  updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  setToken: (token) => set({ token }),
  setwebSocketToken: (webSocketToken) => set({ webSocketToken }),
  setwebSocket: (webSocket) => set({ webSocket }),
  login: () => set({ isLoggined: true }),
  logout: () => {
    const { webSocket } = get(); // Get the current state, including the webSocket if it exists
    if (webSocket !== null) {
      //webSocket.close(); // Close the WebSocket connection if it exists
    }
    // Then, update the state to reflect the logout process
    set({ isLoggined: false, token: "", user: null, isBlocked: false, webSocketToken: null, webSocket: null });
  },
  blockUser: () => set({ isBlocked: true }),
  unblockUser: () => set({ isBlocked: false }),

  connectWebSocket: (token) => {
    const webSocket = new WebSocket(`${WS_BASE_URL}/connect?token=${token}`);

    webSocket.onopen = () => {
      console.log('WebSocket Connected');
    };
    webSocket.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    set({ webSocket });
  },

  initializeFromLocalStorage: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedisLoggined = localStorage.getItem("isLoggined");
    const storedIsBlocked = localStorage.getItem("isBlocked");
    const webSocketToken = localStorage.getItem("webSocketToken");
    const webSocket = localStorage.getItem("webSocket");

    set({
      user: JSON.parse(storedUser),
      token: storedToken,
      isLoggined: JSON.parse(storedisLoggined),
      isBlocked: JSON.parse(storedIsBlocked),
      webSocketToken,
      webSocket: JSON.parse(webSocket)
    });
  },

  persistToLocalStorage: () => {
    const { user, token, isLoggined, isBlocked, webSocketToken, webSocket } = get();
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("isLoggined", JSON.stringify(isLoggined));
    localStorage.setItem("isBlocked", JSON.stringify(isBlocked));
    localStorage.setItem("webSocketToken", webSocketToken);
    localStorage.setItem("webSocket", JSON.stringify(webSocket))
  },
  clearAllData: () => {
    localStorage.clear();
    set({
      user: null,
      token: null,
      isLoggined: false,
      isBlocked: false,
      webSocketToken: null,
      webSocket: null
    });
  },
}));

store.getState().initializeFromLocalStorage();

store.subscribe((state) => state.persistToLocalStorage());

export default store;
