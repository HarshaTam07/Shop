"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
const LAST_PING_KEY = "supabase_last_ping";

export default function KeepAlive() {
  useEffect(() => {
    const checkAndPing = async () => {
      try {
        // Get last ping timestamp from localStorage
        const lastPingStr = localStorage.getItem(LAST_PING_KEY);
        const lastPing = lastPingStr ? parseInt(lastPingStr) : 0;
        const now = Date.now();

        // Check if 3 days have passed since last ping
        if (now - lastPing >= THREE_DAYS_MS) {
          console.log("Pinging Supabase to keep it active...");

          // Simple query to keep Supabase active
          const { error } = await supabase
            .from("items")
            .select("id", { count: "exact", head: true })
            .limit(1);

          if (!error) {
            // Update last ping timestamp
            localStorage.setItem(LAST_PING_KEY, now.toString());
            console.log("Supabase ping successful!");
          } else {
            console.error("Supabase ping failed:", error);
          }
        } else {
          const nextPing = new Date(lastPing + THREE_DAYS_MS);
          console.log(`Next Supabase ping scheduled for: ${nextPing.toLocaleString()}`);
        }
      } catch (error) {
        console.error("Keep-alive error:", error);
      }
    };

    // Run check on component mount
    checkAndPing();

    // Also run check every hour while app is open (in case user keeps it open for days)
    const interval = setInterval(checkAndPing, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}
