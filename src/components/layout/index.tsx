import Navbar from "../navbar";
import {Outlet} from "react-router-dom";
import Toast from "../toast";


const Layout = () => {
    return (
        <>
            <Navbar/>
            <div>
                <Toast message={"test"} type={"success"} id={0} removeToast={function (id: number): void {
                    throw new Error("Function not implemented.");
                }}  />
                <Outlet />
            </div>
        </>
    );
}

export default Layout;