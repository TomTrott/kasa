"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Heart, MessageCircle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        setUser(null);
        setFavoritesCount(0);
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      try {
        const res = await api.get(
          `/api/users/${userData.id}/favorites`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFavoritesCount(res.data.length);
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();

    window.addEventListener("auth-changed", loadUser);
    window.addEventListener("favorites-changed", loadUser);

    return () => {
      window.removeEventListener("auth-changed", loadUser);
      window.removeEventListener("favorites-changed", loadUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setFavoritesCount(0);
    setUser(null);

    window.dispatchEvent(new Event("auth-changed"));

    router.push("/login");
  };

  return (
    <header className="px-6 py-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl h-20 px-10 flex items-center justify-between shadow-sm">
        {/* gauche */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => router.push("/")}
            className="text-lg hover:text-red-500"
          >
            Accueil
          </button>

          <button
            onClick={() => router.push("/about")}
            className="text-lg hover:text-red-500"
          >
            À propos
          </button>
        </div>

        {/* centre */}
        <button
          onClick={() => router.push("/")}
          className="text-5xl font-bold"
        >
          <span className="text-orange-500">Kasa</span>
        </button>

        {/* droite */}
        <div className="flex items-center gap-6">
          {user && (
            <button
              onClick={() => router.push("/owner/properties/new")}
              className="text-red-600 text-lg hover:opacity-80"
            >
              + Ajouter un logement
            </button>
          )}

          {/* Favoris */}
          {user && (
            <button
              onClick={() => router.push("/favorites")}
              className="relative"
            >
              <Heart
                size={26}
                className="text-red-500 hover:scale-110 transition"
                fill="currentColor"
              />

              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Chat */}
          {user && (
            <button
              onClick={() => router.push("/chat")}
              className="hover:scale-110 transition"
            >
              <MessageCircle
                size={26}
                className="text-gray-700 hover:text-blue-500"
              />
            </button>
          )}

          {user ? (
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Déconnexion
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}