import { Outlet } from "react-router-dom";
import Nav from "./NavTeacher";

function RootLayoutTeacher() {
    return (
        <>
            <Nav />
            <main>
            {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
            <Outlet />
            </main>
        </>
    );
}

export default RootLayoutTeacher;