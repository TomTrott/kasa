"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/services/api";

interface Property {
  id: string;
  title: string;
  cover: string;
  location: string;
  price_per_night: number;
}

type FavoritesContextType = {
  favorites: Property[];
  loading: boolean;
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (property: Property) => Promise<void>;
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Clé utilisée pour mettre en cache les favoris dans localStorage
const STORAGE_KEY = "favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Initialisation depuis le cache localStorage plutôt qu'un tableau vide
  const [favorites, setFavorites] = useState<Property[]>(() => {
    // Pas de localStorage côté serveur, donc on repart d'un tableau vide
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      // Utilisateur non connecté on vide les favoris et le cache associé
      if (!user) {
        setFavorites([]);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const res = await api.get(`/api/users/${user.id}/favorites`);
      setFavorites(res.data);
      // On garde le cache localStorage synchronisé avec la source serveur
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Un seul fetch au montage du Provider 
  useEffect(() => {
    loadFavorites();
  }, []);

  const isFavorite = (propertyId: string) =>
    favorites.some((f) => f.id === propertyId);

  const toggleFavorite = async (property: Property) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez vous connecter");
      return;
    }

    const alreadyFavorite = isFavorite(property.id);
    // Copie de l'état actuel, gardée en mémoire pour un rollback si l'API échoue
    const previous = favorites;
    const updated = alreadyFavorite
      ? favorites.filter((f) => f.id !== property.id)
      : [...favorites, property];

    // Mise à jour immédiate de l'UI, avant même la réponse du serveur
    setFavorites(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      if (alreadyFavorite) {
        await api.delete(`/api/properties/${property.id}/favorite`);
      } else {
        await api.post(`/api/properties/${property.id}/favorite`);
      }
      // Volontairement pas de loadFavorites() 
    } catch (error) {
      console.error(error);
      // L'appel API a échoué on annule la mise à jour optimiste
      setFavorites(previous);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, isFavorite, toggleFavorite, refresh: loadFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook d'accès au Context lève une erreur explicite si utilisé hors du FavoritesProvider, plutôt qu'un undefined silencieux qui plante ailleurs
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites doit être utilisé dans un FavoritesProvider");
  return ctx;
}