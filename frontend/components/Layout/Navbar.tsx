"use client";
import Logo from "@/assets/images/Logo.webp";
import MobileLogo from "@/assets/images/Logo-mobile.webp";
import BurgerIcon from "@/assets/images/burger.webp";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart, MessageCircle, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Le nombre de favoris vient directement du Context : plus besoin de
  // fetch ni d'écouter l'événement "favorites-changed", il se met à jour
  // automatiquement dès que favorites change ailleurs dans l'app
  const { favorites } = useFavorites();
  const favoritesCount = favorites.length;

  useEffect(() => {
    // Charge l'utilisateur connecté depuis le localStorage
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        setUser(null);
        return;
      }

      setUser(JSON.parse(storedUser));
    };

    // Appelée au montage et lors de l'événement "auth-changed"
    // (connexion/déconnexion) — ceci reste un event DOM car l'authentification
    // n'est pas gérée par un Context dans ce projet
    loadUser();
    window.addEventListener("auth-changed", loadUser);

    return () => {
      window.removeEventListener("auth-changed", loadUser);
    };
  }, []);

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/login");
  };
  // Fonction pour fermer le menu mobile et naviguer vers une page
  const closeAndNavigate = (path: string) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* ─── Desktop Navbar ─── */}
      <header className="hidden md:block px-4 py-2">
        <div className="relative max-w-4xl mx-auto bg-white rounded-[20px] h-[72px] px-6 md:px-10 flex items-center justify-between mt-5">
          <div className="flex items-center gap-12">
            <button onClick={() => router.push("/")} className="text-[18px] text-[#222] hover:text-[#9F3A1D]">
              Accueil
            </button>
            <button onClick={() => router.push("/about")} className="text-[18px] text-[#222] hover:text-[#9F3A1D]">
              À propos
            </button>
          </div>

          <button onClick={() => router.push("/")} className="absolute left-1/2 -translate-x-1/2">
            <Image src={Logo} alt="Kasa" width={130} height={60} priority className="object-contain" />
          </button>

          <div className="flex items-center gap-4">
            {user && (user.role === "owner" || user.role === "admin") && (
              <button
                onClick={() => router.push("/properties/new")}
                className="text-[#9F3A1D] text-[16px] font-medium hover:opacity-80"
              >
                +Ajouter un logement
              </button>
            )}

            {user && (
              <div className="flex items-center gap-3">
                {/* Favoris avec compteur inline */}
                <button
                  aria-label="Voir mes favoris"
                  onClick={() => router.push("/favorites")}
                  className="flex items-center gap-1"
                >
                  <Heart size={18} strokeWidth={1.5} className="text-[#9F3A1D]" />
                  {favoritesCount > 0 && (
                    <span className="text-[13px] text-[#9F3A1D] font-medium">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* Séparateur */}
                <span className="text-[#9F3A1D]/40 text-lg">|</span>

                {/* Messagerie */}
                <button
                  aria-label="Messagerie"
                  onClick={() => router.push("/chat")}
                >
                  <MessageCircle size={18} strokeWidth={1.5} className="text-[#9F3A1D]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Mobile Navbar ─── */}
      <header className="md:hidden w-full bg-white">
        {/* Barre du haut */}
        <div className="flex items-center justify-between h-[72px] px-5">
          <button onClick={() => router.push("/")}>
            <Image src={MobileLogo} alt="Kasa" width={47} height={47} priority className="object-contain" />
          </button>
          <button
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={28} className="text-black" />
            ) : (
              <Image src={BurgerIcon} alt="Menu" width={50} height={50} />
            )}
          </button>
        </div>

        {/* Menu plein écran */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col px-5 pt-5">
            {/* Header du menu */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => closeAndNavigate("/")}>
                <Image src={MobileLogo} alt="Kasa" width={47} height={47} priority className="object-contain" />
              </button>
              <button aria-label="Fermer le menu" onClick={() => setMobileMenuOpen(false)}>
                <X size={28} className="text-black" />
              </button>
            </div>

            {/* Liens */}
            <nav className="flex flex-col flex-1">
              <button
                onClick={() => closeAndNavigate("/")}
                className="text-left text-[20px] text-black py-6 border-b border-gray-200"
              >
                Accueil
              </button>

              <button
                onClick={() => closeAndNavigate("/about")}
                className="text-left text-[20px] text-black py-6 border-b border-gray-200"
              >
                À propos
              </button>

              {user && (
                <>
                  <button
                    onClick={() => closeAndNavigate("/chat")}
                    className="text-left text-[20px] text-black py-6 border-b border-gray-200"
                  >
                    Messagerie
                  </button>

                  <button
                    onClick={() => closeAndNavigate("/favorites")}
                    className="text-left text-[20px] text-black py-6 border-b border-gray-200"
                  >
                    Favoris
                  </button>
                </>
              )}

              {/* Bouton Ajouter un logement */}
              {user && (user.role === "owner" || user.role === "admin") && (
                <div className="mt-8">
                  <button
                    onClick={() => closeAndNavigate("/properties/new")}
                    className="bg-[#9F3A1D] text-white text-[16px] font-medium px-6 py-4 rounded-full hover:opacity-90 transition"
                  >
                    Ajouter un logement
                  </button>
                </div>
              )}

              {/* Déconnexion */}
              {user && (
                <div className="mt-auto pb-8">
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-red-500 text-[16px]"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}