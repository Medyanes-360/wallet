"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Swal from "sweetalert2";

const useActivityTracker = (inactivityDuration = 3600000) => {
  // Default inactivity duration is 1 hour

  const { data: session } = useSession(); // Get session data to track if the user is logged in
  const warningDuration = 300000; // 5 minutes before the user is signed out
  const [showWarning, setShowWarning] = useState(false); // State to control when to show the warning pop up

  useEffect(() => {
    // If no session is available, do not run the inactivity tracker
    if (!session) return;

    let timeout, warningTimeout; // Declare timeout variables for both inactivity sign-out and warning

    // Reset timers when user is activive
    const resetTimer = () => {
      clearTimeout(timeout); // Clear any existing sign-out timer
      clearTimeout(warningTimeout); // Clear any existing warning timer

      // Reset the warning state in case it was already triggered
      setShowWarning(false);

      // Set a new timer for automatic sign-out after the inactivity duration
      timeout = setTimeout(() => {
        console.log("You have been inactive for too long. Signing out...");
        // signOut({ redirect: true, callbackUrl: "/login" }); // Auto log-out after the inactivity duration
      }, inactivityDuration);

      // Set a new timer to trigger the warning 5 minutes before sign-out
      warningTimeout = setTimeout(() => {
        setShowWarning(true); // Show warning 5 minutes before inactivity sign-out
      }, inactivityDuration - warningDuration); // inactivityDuration - warningDuration = 60mins - 5mins = 55mins
    };

    // Listen for mouse movements and keyboard events to detect user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Start the inactivity timer as soon as the effect runs
    resetTimer();

    // Cleanup function to clear timeouts and remove event listeners on unmount
    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [inactivityDuration, session]); // only re-run if inactivityDuration or session changes

  useEffect(() => {
    // If the warning state is true, show the warning pop up
    if (showWarning) {
      Swal.fire({
        title: "You have been inactive!",
        text: "You will be signed out in 5 minutes if you don't become active.",
        icon: "warning",
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: "Tamam",
      }).then((res) => {
        if (res.isConfirmed) {
          // If user acknowledges the warning, hide the warning pop up
          setShowWarning(false);
        }
      });
    }
  }, [showWarning]); // Only run this effect when showWarning changes
};

export default useActivityTracker;
