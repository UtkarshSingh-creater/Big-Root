import { useState, useEffect } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) setUser(stored);
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("uiRole", data.uiRole);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return { user, login, logout };
}