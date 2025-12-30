import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Tracks tester session time for payroll purposes
 * Add this component to the Layout to track all testers
 */
export default function TesterSessionTracker() {
  const [sessionStart, setSessionStart] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initTracking = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        if (currentUser.is_tester) {
          setUser(currentUser);
          setSessionStart(new Date());
          
          // Log session start
          await base44.entities.ActivityLog.create({
            user_email: currentUser.email,
            action_type: "tester_session_start",
            action_details: "Tester session started",
            ip_address: window.location.hostname,
            user_agent: navigator.userAgent
          });
        }
      } catch (err) {
        console.error("Session tracking error:", err);
      }
    };

    initTracking();

    // Track page visibility changes
    const handleVisibilityChange = async () => {
      if (document.hidden && user?.is_tester && sessionStart) {
        // Page hidden - log session pause
        const duration = Math.floor((new Date() - sessionStart) / 1000 / 60); // minutes
        
        try {
          await base44.entities.ActivityLog.create({
            user_email: user.email,
            action_type: "tester_session_pause",
            action_details: `Session paused after ${duration} minutes`,
            user_agent: navigator.userAgent
          });
        } catch (err) {
          console.error("Session pause tracking error:", err);
        }
      } else if (!document.hidden && user?.is_tester) {
        // Page visible - resume session
        setSessionStart(new Date());
        
        try {
          await base44.entities.ActivityLog.create({
            user_email: user.email,
            action_type: "tester_session_resume",
            action_details: "Session resumed",
            user_agent: navigator.userAgent
          });
        } catch (err) {
          console.error("Session resume tracking error:", err);
        }
      }
    };

    // Track before page unload
    const handleBeforeUnload = async () => {
      if (user?.is_tester && sessionStart) {
        const duration = Math.floor((new Date() - sessionStart) / 1000 / 60); // minutes
        
        try {
          await base44.entities.ActivityLog.create({
            user_email: user.email,
            action_type: "tester_session_end",
            action_details: `Session ended after ${duration} minutes`,
            user_agent: navigator.userAgent
          });
        } catch (err) {
          console.error("Session end tracking error:", err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Periodic heartbeat every 5 minutes
    const heartbeatInterval = setInterval(async () => {
      if (user?.is_tester && sessionStart && !document.hidden) {
        try {
          await base44.entities.ActivityLog.create({
            user_email: user.email,
            action_type: "tester_heartbeat",
            action_details: "Active session heartbeat",
            user_agent: navigator.userAgent
          });
        } catch (err) {
          console.error("Heartbeat tracking error:", err);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(heartbeatInterval);
    };
  }, [user, sessionStart]);

  // This component renders nothing
  return null;
}