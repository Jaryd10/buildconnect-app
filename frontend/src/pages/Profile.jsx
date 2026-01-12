import { useParams, useNavigate } from "react-router-dom";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const displayName = username || "Unknown";

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=0D8ABC&color=fff&size=256`;

  const initials = displayName.slice(0, 2).toUpperCase();

  const handleMessageUser = () => {
    navigate(`/messages?user=${encodeURIComponent(displayName)}`);
  };

  return (
    <div className="min-h-screen p-8 profile-page">
      <div className="max-w-2xl mx-auto profile-card">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-xl object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 rounded-xl bg-sky-600 flex items-center justify-center text-3xl font-bold text-white pointer-events-none">
              {initials}
            </div>
          </div>

          {/* User info */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold profile-name">
              {displayName}
            </h1>
            <p className="profile-sub">
              BuildConnect member
            </p>

            {/* Message Button */}
            <button
              onClick={handleMessageUser}
              className="mt-4 px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-500 transition"
            >
              Message {displayName}
            </button>
          </div>
        </div>

        <div className="h-px profile-divider my-6" />

        <p className="profile-text">
          This is a public profile. Profile editing and avatars will be added next.
        </p>
      </div>
    </div>
  );
}
