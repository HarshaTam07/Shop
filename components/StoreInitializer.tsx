"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function StoreInitializer() {
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return null;
}
