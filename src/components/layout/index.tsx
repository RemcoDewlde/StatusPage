import Navbar from "../navbar";
import {Outlet} from "react-router-dom";
import Toast from "../toast";


const Layout = () => {
    return (
        <>
            <Navbar/>
            <div>
                <Toast message={"test"} type={"error"} id={0} closable={true} removeToast={function (): void {
                    throw new Error("Function not implemented.");
                }}  />
                <Outlet />
            </div>
        </>
    );
}

export default Layout;