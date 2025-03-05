import axios, { AxiosInstance } from "axios";

export const dwengoAPI: AxiosInstance = axios.create({
  baseURL: process.env.DWENGO_BASE_URL || "https://dwengo.org/backend",
  // Je kunt hier global headers, timeouts, etc. instellen
});
