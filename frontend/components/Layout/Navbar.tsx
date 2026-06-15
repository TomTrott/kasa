"use client";
import Logo from "@/assets/images/Logo.png";
import MobileLogo from "@/assets/images/Logo-mobile.png";
import BurgerIcon from "@/assets/images/burger.png";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Heart, MessageCircle, Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        const res = await api.get(`/api/users/${userData.id}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
    <>
      {/* Desktop Navbar */}
      <header className="hidden md:block px-4 py-2">
        <div className="relative max-w-7xl mx-auto bg-white rounded-[20px] h-[72px] px-6 md:px-10 flex items-center justify-between">
          {/* Navigation desktop gauche */}
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

          {/* Logo desktop centré */}
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

          {/* Navigation desktop droite */}
          <div className="flex items-center gap-5">
            {user && (user.role === "owner" || user.role === "admin") && (
              <button
                onClick={() => router.push("/properties/new")}
                className="text-[#9F3A1D] text-[18px] font-medium hover:opacity-80"
              >
                + Ajouter un logement
              </button>
            )}

            {user && (
              <>
                <button
                  type="button"
                  aria-label="Voir mes favoris"
                  title="Voir mes favoris"
                  onClick={() => router.push("/favorites")}
                  className="relative"
                >
                  <Heart size={18} strokeWidth={1.8} className="text-[#9F3A1D]" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-[10px] bg-[#9F3A1D] text-white rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </button>
                <div className="w-px h-5 bg-[#9F3A1D]/40" />
                <button
                  type="button"
                  aria-label="Ouvrir la messagerie"
                  title="Ouvrir la messagerie"
                  onClick={() => router.push("/chat")}
                >
                  <MessageCircle size={18} strokeWidth={1.8} className="text-[#9F3A1D]" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}
      <header className="md:hidden w-full bg-white shadow-sm">
        <div className="flex items-center justify-between h-[72px] px-4">
          {/* Mobile: Logo gauche */}
          <button onClick={() => router.push("/")}>
            <Image
              src={MobileLogo}
              alt="Kasa"
              width={47.5}
              height={20}
              priority
              className="object-contain"
            />
          </button>

          {/* Menu burger mobile */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            title={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Image src={BurgerIcon} alt="Menu" width={50} height={50} />}
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="w-full bg-white shadow-lg p-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  router.push("/");
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2"
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  router.push("/about");
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2"
              >
                À propos
              </button>
              {user && (user.role === "owner" || user.role === "admin") && (
                <button
                  onClick={() => {
                    router.push("/properties/new");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-[#9F3A1D] font-medium"
                >
                  + Ajouter un logement
                </button>
              )}
              {user && (
                <>
                  <button
                    onClick={() => {
                      router.push("/favorites");
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2"
                  >
                    Favoris ({favoritesCount})
                  </button>
                  <button
                    onClick={() => {
                      router.push("/chat");
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2"
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-2 text-red-500"
                  >
                    Déconnexion
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}