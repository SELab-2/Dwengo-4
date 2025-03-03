import axios from "axios";

export const dwengoAPI = axios.create({
  baseURL: process.env.DWENGO_BASE_URL || "https://dwengo.org/backend",
  // Je kunt hier headers, timeouts, etc. instellen
});