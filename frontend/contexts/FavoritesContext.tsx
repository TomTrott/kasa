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

const STORAGE_KEY = "favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Property[]>(() => {
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

      if (!user) {
        setFavorites([]);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const res = await api.get(`/api/users/${user.id}/favorites`);
      setFavorites(res.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
    const previous = favorites;

    // Optimistic update — plus besoin de refetch après coup :
    // - suppression : le filtre suffit, aucune donnée manquante
    // - ajout : on a déjà l'objet property complet passé en argument
    const updated = alreadyFavorite
      ? favorites.filter((f) => f.id !== property.id)
      : [...favorites, property];

    setFavorites(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      if (alreadyFavorite) {
        await api.delete(`/api/properties/${property.id}/favorite`);
      } else {
        await api.post(`/api/properties/${property.id}/favorite`);
      }
      // Plus de loadFavorites() ici : on évite la race condition
      // avec d'éventuels refresh() déclenchés ailleurs (ex: montage de page)
    } catch (error) {
      console.error(error);
      // Rollback en cas d'échec réel de l'API
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

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites doit être utilisé dans un FavoritesProvider");
  return ctx;
}