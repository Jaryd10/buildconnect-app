import { useState } from "react";
import axios from "axios";

export default function UserProfile() {
  const username = localStorage.getItem("username") || "Jay";
  const [preview, setPreview] = useState(null);

  const uploadAvatar = async (file) => {
    const fd = new FormData();
    fd.append("avatar", file);

    await axios.post(
      `http://localhost:4000/users/${username}/avatar`,
      fd
    );

    alert("Profile picture updated. Refresh to see changes.");
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Edit Profile</h1>
      <p>Logged in as <strong>{username}</strong></p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          setPreview(URL.createObjectURL(file));
          uploadAvatar(file);
        }}
      />

      {preview && (
        <div style={{ marginTop: 20 }}>
          <img
            src={preview}
            alt="preview"
            style={{ width: 120, height: 120, borderRadius: "50%" }}
          />
        </div>
      )}
    </div>
  );
}

