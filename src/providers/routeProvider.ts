import Home from "../pages/Home";
import Settings from "../pages/Settings";
import { FaRegObjectGroup } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";

const routes = [
    { component: Home, path: "/", name: ("Dashboard"), icon: FaRegObjectGroup },
    { component: Settings, path: "/settings", name: ("Settings"), icon: FiSettings }
];
export default routes;