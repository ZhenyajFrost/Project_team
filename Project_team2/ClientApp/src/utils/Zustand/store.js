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
  updateData: (data) => set({ ...get(), ...data }),
  updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  setToken: (token) => set({ token }),
  setLikedLotsId: (likedLotIds) =>set({ user:{...get().user, likedLotIds} }),
  setlikedUsers: (likedUsers) =>set({ user:{...get().user, likedUsers} }),
  setwebSocketToken: (webSocketToken) => set({ webSocketToken }),
  setwebSocket: (webSocket) => set({ webSocket }),
  login: () => set({ isLoggined: true }),
  logout: () => {
    const { webSocket } = get(); // Get the current state, including the webSocket if it exists
    if (webSocket !== null) {
      //webSocket.close(); // Close the WebSocket connection if it exists
    }
    // Then, update the state to reflect the logout process
    set({
      isLoggined: false,
      token: "",
      user: null,
      isBlocked: false,
      webSocketToken: null,
      webSocket: null,
    });
  },
  blockUser: () => set({ isBlocked: true }),
  unblockUser: () => set({ isBlocked: false }),

  connectWebSocket: (token) => {
    const webSocket = new WebSocket(`${WS_BASE_URL}/connect?token=${token}`);

    webSocket.onopen = () => {
      console.log("WebSocket Connected");
    };
    webSocket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    set({ webSocket });
  },

  initializeFromsessionStorage: () => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");
    const storedisLoggined = sessionStorage.getItem("isLoggined");
    const storedIsBlocked = sessionStorage.getItem("isBlocked");
    const webSocketToken = sessionStorage.getItem("webSocketToken");
    const webSocket = sessionStorage.getItem("webSocket");

    set({
      user: JSON.parse(storedUser),
      token: storedToken,
      isLoggined: JSON.parse(storedisLoggined),
      isBlocked: JSON.parse(storedIsBlocked),
      webSocketToken,
      webSocket: JSON.parse(webSocket),
    });
  },

  persistTosessionStorage: () => {
    const {
      user,
      token,
      isLoggined,
      isBlocked,
      webSocketToken,
      webSocket,
      likedLotsId,
    } = get();
    console.log(get());
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("isLoggined", JSON.stringify(isLoggined));
    sessionStorage.setItem("isBlocked", JSON.stringify(isBlocked));
    sessionStorage.setItem("webSocketToken", webSocketToken);
    sessionStorage.setItem("webSocket", JSON.stringify(webSocket));
    sessionStorage.setItem("likedLotsId", JSON.stringify(likedLotsId));
  },
  clearAllData: () => {
    sessionStorage.clear();
    set({
      user: null,
      token: null,
      isLoggined: false,
      isBlocked: false,
      webSocketToken: null,
      webSocket: null,
    });
  },
}));

store.getState().initializeFromsessionStorage();

store.subscribe((state) => state.persistTosessionStorage());

export default store;
