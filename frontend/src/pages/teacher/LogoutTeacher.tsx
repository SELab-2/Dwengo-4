import { redirect } from "react-router-dom";

export function action(): Response {
  localStorage.removeItem("token");
  localStorage.removeItem("expiration");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
  localStorage.removeItem("role");
  return redirect("/");
}
