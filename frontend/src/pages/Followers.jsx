import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useSocket } from "../context/SocketContext";

export default function Followers() {
  const { username } = useUser();
  const socket = useSocket();
  const [users, setUsers] = useState({});

  useEffect(() => {
    if (!username || !socket) return;

    socket.emit("register_user", username);

    socket.on("followers_data", (data) => {
      setUsers(data || {});
    });

    return () => {
      socket.off("followers_data");
    };
  }, [username, socket]);

  const follow = (target) => {
    socket.emit("follow_user", { from: username, to: target });
  };

  const unfollow = (target) => {
    socket.emit("unfollow_user", { from: username, to: target });
  };

  const otherUsers = Object.keys(users).filter((u) => u !== username);

  return (
    <div style={{ padding: 24, color: "#fff", maxWidth: 700 }}>
      <h2 style={{ marginBottom: 6 }}>People on BuildConnect</h2>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Connect with professionals and businesses
      </p>

      {otherUsers.length === 0 && (
        <div style={{ opacity: 0.7 }}>No other users online.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {otherUsers.map((user) => {
          const isFollowing =
            users[username]?.following?.includes(user);

          const followersCount = users[user]?.followers?.length || 0;
          const followingCount = users[user]?.following?.length || 0;

          return (
            <div
              key={user}
              style={{
                background: "linear-gradient(180deg,#020617,#020617)",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* User info */}
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {user}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {followersCount} followers · {followingCount} following
                </div>
              </div>

              {/* Action */}
              {isFollowing ? (
                <button
                  onClick={() => unfollow(user)}
                  style={unfollowBtn}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={() => follow(user)}
                  style={followBtn}
                >
                  Follow
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Button styles ===== */

const followBtn = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const unfollowBtn = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid #334155",
  background: "transparent",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};
