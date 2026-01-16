import { useUser } from "../context/UserContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <div style={{ padding: 24 }}>Checking login…</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Login required</h2>
        <p>You must be logged in to access this section.</p>
      </div>
    );
  }

  return children;
}
