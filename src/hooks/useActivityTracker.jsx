"use client";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const useActivityTracker = (inactivityDuration = 3600000) => {
  // Default: 1h
  const {data: session} = useSession()
  
  useEffect(() => {
    if(!session) return 

    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Automatically log out the user after inactivity duration
        signOut({ redirect: true, callbackUrl: "/login" });
      }, inactivityDuration);
    };

    // Listen for mouse movements and keyboard events
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Start the inactivity timer
    resetTimer();

    // Cleanup event listeners on unmount
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [inactivityDuration]);
};

export default useActivityTracker;
