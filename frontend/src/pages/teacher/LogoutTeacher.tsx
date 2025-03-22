import { redirect } from "react-router-dom";

export function action(): Response {
  localStorage.removeItem("token");
  localStorage.removeItem("expiration");
  return redirect("/");
}
