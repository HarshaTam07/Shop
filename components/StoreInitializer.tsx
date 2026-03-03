"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function StoreInitializer() {
  const loadFromStorage = useStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return null;
}
