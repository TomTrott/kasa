"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 shadow-md bg-white">
      <h1
        className="text-2xl font-bold text-red-500 cursor-pointer"
        onClick={() => router.push("/")}
      >
        Kasa
      </h1>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-700">👋 {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}