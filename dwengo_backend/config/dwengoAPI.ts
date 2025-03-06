import axios, { AxiosInstance } from "axios";

export const dwengoAPI: AxiosInstance = axios.create({
  baseURL: process.env.DWENGO_BASE_URL || "https://dwengo.org/backend",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 5000,
});

