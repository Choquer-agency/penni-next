"use client";
import { useEffect } from "react";

export default function RouteBodyClass({ value }: { value: string }) {
  useEffect(() => {
    document.body.setAttribute("data-route", value);
    return () => {
      document.body.removeAttribute("data-route");
    };
  }, [value]);
  return null;
}
