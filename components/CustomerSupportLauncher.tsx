"use client";

import { usePathname } from "next/navigation";
import SupportWidget from "@/components/SupportWidget";

const HIDDEN_PREFIXES = [
  "/admin",
  "/driver",
  "/driver/dashboard",
  "/merchant",
  "/merchant/dashboard",
  "/restaurants",
  "/rewards",
  "/login",
  "/signup",
  "/driver/login",
  "/driver/signup",
  "/merchant/login",
  "/merchant/signup",
];

export default function CustomerSupportLauncher() {
  const pathname = usePathname();
  const shouldHide = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) return null;

  return <SupportWidget role="CUSTOMER" />;
}
