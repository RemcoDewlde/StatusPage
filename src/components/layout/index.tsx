import {Outlet} from "react-router-dom";
import Sidebar from "../sidebar";

const AppLayout = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 h-screen">
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayout;