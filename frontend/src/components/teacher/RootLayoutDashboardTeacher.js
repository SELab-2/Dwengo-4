import { useEffect } from "react";
import { Outlet, useLoaderData, useSubmit } from "react-router-dom";
import { getTokenDuration } from "../../util/teacher/authTeacher.js";
import styles from "./RootLayoutDashboardTeacher.module.css";
import SideBarTeacher from "./SideBarTeacher.js";

function RootLayoutDashboardTeacher() {
   const token = useLoaderData();
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
         <SideBarTeacher></SideBarTeacher>
         <main className="px-20 py-20">
            {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
            <Outlet />
         </main>
      </div>
   );
}

export default RootLayoutDashboardTeacher;
