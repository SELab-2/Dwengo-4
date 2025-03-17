import { Outlet } from "react-router-dom";
import Nav from "./NavStudent";
import React from "react";

function RootLayoutStudent() {
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

export default RootLayoutStudent;