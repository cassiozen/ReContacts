"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let isDark: boolean = false;
if (typeof window !== "undefined") {
  isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ClientToastContainer() {
  return <ToastContainer theme={isDark ? "dark" : "light"} autoClose={false} />;
}
