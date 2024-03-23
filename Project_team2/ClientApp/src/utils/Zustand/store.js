import { create } from "zustand";
import { persist, createJSONStorage  } from "zustand/middleware";

// Check if window object is defined (to prevent issues in non-browser environments)
const sessionStorage =
  typeof window !== "undefined"
    ? createJSONStorage (window.sessionStorage)
    : null;


const store = create(
  persist(
    (set) => ({
      user: {},
      isLoggined: false,
      token: "",
      isBlocked: false,
      setData: (data) =>
        set(() => {
          if (sessionStorage) {
            sessionStorage.setItem("token", data.token);
          }
          return { ...data };
        }),
      updateData: (data) => set((state) => ({ ...state, ...data })),
      updateUser: (data) =>
        set((state) => ({ ...state, user: { ...state.user, ...data } })),
      setIsBlocked: (data) => set((state) => ({ ...state, isBlocked: data })),
    }),
    {
      name: "persistedStore",
      getStorage: () => sessionStorage,
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => JSON.parse(str),
    }
  )
);

// Initialize token from sessionStorage if available
if (sessionStorage) {
  const storedToken = sessionStorage.getItem("token");
  if (storedToken) {
    store.setState({ token: storedToken });
  }
}

export default store;
