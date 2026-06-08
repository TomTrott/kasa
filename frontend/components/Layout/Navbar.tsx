"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/images/Logo.png";

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
    <header className="px-4 py-2">
      <div className="max-w-7xl mx-auto bg-whiterounded-[20px] h-[72px] px-10 flex items-center justify-between">
        {/* Navigation gauche */}
        <div className="flex items-center gap-12">
          <button
            onClick={() => router.push("/")}
            className="text-[18px] text-[#222] hover:text-[#9F3A1D]"
          >
            Accueil
          </button>

          <button
            onClick={() => router.push("/about")}
            className="text-[18px] text-[#222] hover:text-[#9F3A1D]"
          >
            À propos
          </button>
        </div>

        {/* Logo centré */}
        <button
          onClick={() => router.push("/")}
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Image
            src={Logo}
            alt="Kasa"
            width={130}
            height={60}
            priority
            className="object-contain"
          />
        </button>

        {/* Navigation droite */}
        <div className="flex items-center gap-5">
          {user && (
            <button
              onClick={() => router.push("/owner/properties/new")}
              className="text-[#9F3A1D] text-[18px] font-medium hover:opacity-80"
            >
              +Ajouter un logement
            </button>
          )}

          {user && (
            <>
              <button
                onClick={() => router.push("/favorites")}
                className="relative"
              >
                <Heart
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#9F3A1D]"
                />

                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] bg-[#9F3A1D] text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <div className="w-px h-5 bg-[#9F3A1D]/40" />

              <button
                onClick={() => router.push("/chat")}
              >
                <MessageCircle
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#9F3A1D]"
                />
              </button>
            </>
          )}

          {!user && (
            <button
              onClick={() => router.push("/login")}
              className="text-[#9F3A1D] text-[16px]"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}