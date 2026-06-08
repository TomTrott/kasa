"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import {
  Heart,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";

import Logo from "@/assets/images/Logo.png";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

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
    window.addEventListener(
      "favorites-changed",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "auth-changed",
        loadUser
      );
      window.removeEventListener(
        "favorites-changed",
        loadUser
      );
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setFavoritesCount(0);
    setUser(null);

    window.dispatchEvent(
      new Event("auth-changed")
    );

    router.push("/login");
  };

  return (
    <header className="px-4 py-2">
      <div className="relative max-w-7xl mx-auto bg-white rounded-[20px] h-[72px] px-6 md:px-10 flex items-center justify-between">
        {/* Mobile : Logo gauche */}
        <button
          onClick={() => router.push("/")}
          className="md:hidden"
        >
          <Image
            src={Logo}
            alt="Kasa"
            width={95}
            height={40}
            priority
            className="object-contain"
          />
        </button>

        {/* Navigation desktop gauche */}
        <div className="hidden md:flex items-center gap-12">
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

        {/* Logo desktop centré */}
        <button
          onClick={() => router.push("/")}
          className="hidden md:block absolute left-1/2 -translate-x-1/2"
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

        {/* Navigation desktop droite */}
        <div className="hidden md:flex items-center gap-5">
          {user && (
            <button
              onClick={() =>
                router.push(
                  "/owner/properties/new"
                )
              }
              className="text-[#9F3A1D] text-[18px] font-medium hover:opacity-80"
            >
              +Ajouter un logement
            </button>
          )}

          {user && (
            <>
              {/* Favoris */}
              <button
                type="button"
                aria-label="Voir mes favoris"
                title="Voir mes favoris"
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

              {/* Messages */}
              <button
                type="button"
                aria-label="Ouvrir la messagerie"
                title="Ouvrir la messagerie"
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

          {user ? (
            <button
              onClick={logout}
              className="text-[#9F3A1D]"
            >
              Déconnexion
            </button>
          ) : (
            <button
              onClick={() =>
                router.push("/login")
              }
              className="text-[#9F3A1D]"
            >
              Connexion
            </button>
          )}
        </div>

        {/* Menu burger */}
        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? "Fermer le menu"
              : "Ouvrir le menu"
          }
          title={
            mobileMenuOpen
              ? "Fermer le menu"
              : "Ouvrir le menu"
          }
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          className="md:hidden"
        >
          {mobileMenuOpen ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col gap-5">
            <button
              onClick={() => {
                router.push("/");
                setMobileMenuOpen(false);
              }}
              className="text-left"
            >
              Accueil
            </button>

            <button
              onClick={() => {
                router.push("/about");
                setMobileMenuOpen(false);
              }}
              className="text-left"
            >
              À propos
            </button>

            {user && (
              <>
                <button
                  onClick={() => {
                    router.push(
                      "/owner/properties/new"
                    );
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-[#9F3A1D]"
                >
                  + Ajouter un logement
                </button>

                <button
                  onClick={() => {
                    router.push("/favorites");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left"
                >
                  Favoris ({favoritesCount})
                </button>

                <button
                  onClick={() => {
                    router.push("/chat");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left"
                >
                  Messages
                </button>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-red-500"
                >
                  Déconnexion
                </button>
              </>
            )}

            {!user && (
              <button
                onClick={() => {
                  router.push("/login");
                  setMobileMenuOpen(false);
                }}
                className="text-left text-[#9F3A1D]"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}