import { useEffect } from "react";
import { Outlet, useLoaderData, useSubmit } from "react-router-dom";
import { getTokenDuration } from "../../util/student/authStudent";
import styles from "./RootLayoutDashboardStudent.module.css";
import SideBarStudent from "./SideBarStudent";
import React from "react";

const RootLayoutDashboardStudent: React.FC = () => {
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
    <div className={styles.wrapper}>
      <SideBarStudent />
      <main>
        {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayoutDashboardStudent;
