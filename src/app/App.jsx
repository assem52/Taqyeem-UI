
import { Provider } from "react-redux";
import { store } from "./store";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  const dev = false;
  return dev ? (
    <h1>HOME</h1>
  ) : (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
