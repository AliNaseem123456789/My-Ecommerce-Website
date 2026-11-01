import { useEffect, useState } from "react";
import { AuthService } from "../../services/auth.service";

export default function DevicesTab() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const rows = await AuthService.sessions();
      setSessions(rows || []);
    } catch {
      setError("Signed-in devices could not be loaded.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Signed-in devices</h2>
      {error ? <p>{error}</p> : null}
      {sessions.length === 0 ? <p>No active sessions.</p> : null}
      {sessions.map((session) => (
        <div key={session.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
          <p>{session.user_agent || "Unknown device"}</p>
          <p>
            Signed in {session.created_at ? new Date(session.created_at).toLocaleString() : ""}
          </p>
          <button
            type="button"
            onClick={async () => {
              await AuthService.revokeSession(session.id);
              load();
            }}
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
