import "./App.css";
import AppLayout from "./components/layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";

const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "settings",
                element: <Settings />
            }
        ]
    }
]);

const App = () => {

    return (
        <RouterProvider router={router} />
    );
};

export default App;
