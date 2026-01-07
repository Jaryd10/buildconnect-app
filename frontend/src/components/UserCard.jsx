export default function UserCard({ user, currentUser, data, onFollow, onUnfollow }) {
  if (user === currentUser) return null;

  const isFollowing = data[currentUser]?.following.includes(user);

  return (
    <div style={{
      background: "#1e293b",
      padding: 12,
      borderRadius: 12,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <strong>{user}</strong>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Followers: {data[user]?.followers.length || 0} · Following: {data[user]?.following.length || 0}
        </div>
      </div>

      {isFollowing ? (
        <button onClick={() => onUnfollow(user)}>Unfollow</button>
      ) : (
        <button onClick={() => onFollow(user)}>Follow</button>
      )}
    </div>
  );
}
