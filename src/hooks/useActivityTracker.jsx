"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Swal from "sweetalert2";

const useActivityTracker = (inactivityDuration = 3600000) => {
  // Default: 1h
  const { data: session } = useSession();
  const warningDuration = 300000; // 5 minutes before sign out
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!session) return;

    let timeout, warningTimeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);

      // Reset the showWarning in case it was triggered
      setShowWarning(false);

      timeout = setTimeout(() => {
        // Automatically log out the user after inactivity duration
        console.log("You have been inactive for too long. Signing out...");
        // signOut({ redirect: true, callbackUrl: "/login" });
      }, inactivityDuration);

      // Set a timeout for the warning (5 minutes before sign-out)
      warningTimeout = setTimeout(() => {
        setShowWarning(true); // Trigger the warning alert
      }, inactivityDuration - warningDuration);
    };

    // Listen for mouse movements and keyboard events
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Start the inactivity timer
    resetTimer();

    // Cleanup event listeners on unmount
    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [inactivityDuration, session]);

  useEffect(() => {
    if (showWarning) {
      Swal.fire({
        title: "You have been inactive!",
        text: "You will be signed out in 5 minutes if you don't become active.",
        icon: "warning",
        timer: 5000, // Optional: Auto close after 5 minutes
        timerProgressBar: true,
        confirmButtonText: "Tamam",
      }).then((res) => {
        if (res.isConfirmed) {
          setShowWarning(false);
        }
      });
    }
  }, [showWarning]);
};

export default useActivityTracker;
