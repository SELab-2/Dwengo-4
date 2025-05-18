import { Outlet, useLoaderData, useSubmit } from "react-router-dom";

import Nav from "./NavStudent";
import React, { useEffect } from "react";
import { getTokenDuration } from "@/util/student/authStudent";

function RootLayoutStudent() {

        const token = useLoaderData() as string | null;
    const submit = useSubmit();

    useEffect(() => {
        if (!token) {
            return;
        }

        if (token === "EXPIRED") {
            submit(null, { action: "/logout", method: "post" });
            return;
        }

        const tokenDuration = getTokenDuration();

        setTimeout(() => {
            submit(null, { action: "/logout", method: "post" });
        }, tokenDuration);
    }, [token, submit]);
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