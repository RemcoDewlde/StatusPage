import "./App.css";
import Layout from "./components/layout";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />
            },
        ]
    }
]);
const App = () =>{
    return (
            <RouterProvider router={router} />
    );
}

export default App;
