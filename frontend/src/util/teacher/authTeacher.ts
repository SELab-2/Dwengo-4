import { redirect } from "react-router-dom";

export function getTokenDuration(): number {
  const storedExpirationDate = localStorage.getItem("expiration");

  if (!storedExpirationDate) {
    return -1; // Retourneer een negatieve waarde als er geen expiration is opgeslagen
  }

  const expirationDate = new Date(storedExpirationDate);
  if (isNaN(expirationDate.getTime())) {
    return -1; // Retourneer -1 als de datum ongeldig is
  }

  const now = new Date();
  return expirationDate.getTime() - now.getTime();
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const tokenDuration = getTokenDuration();

  if (tokenDuration < 0) {
    return "EXPIRED";
  }

  return token;
}

export function tokenLoader(): string | null {
  return getAuthToken();
}

export function checkAuthLoader(): Response | void {
  const token = getAuthToken();

  if (!token || token === "EXPIRED") {
    return redirect("/teacher/inloggen");
  }
}
