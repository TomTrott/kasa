"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Heart } from "lucide-react";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    cover: string;
    location: string;
    price_per_night: number;
  };
}

export default function PropertyCard({
  property,
}: PropertyCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteStatus();
  }, [property.id]);

  const loadFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!token || !user) {
        setLoading(false);
        return;
      }

      const res = await api.get(
        `/api/users/${user.id}/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const isFavorite = res.data.some(
        (fav: any) => fav.id === property.id
      );

      setFavorite(isFavorite);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Veuillez vous connecter");
        return;
      }

      if (favorite) {
        await api.delete(
          `/api/properties/${property.id}/favorite`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFavorite(false);
      } else {
        await api.post(
          `/api/properties/${property.id}/favorite`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFavorite(true);
      }

      // Met à jour la Navbar instantanément
      window.dispatchEvent(
        new Event("favorites-changed")
      );
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la gestion des favoris");
    }
  };

  return (
  <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1">
    <div className="relative">
      <img
        src={property.cover}
        alt={property.title}
        className="w-full h-[440px] object-cover"
      />

      {!loading && (
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-xl flex items-center justify-center"
        >
          <Heart
            size={18}
            strokeWidth={2}
            className={`transition-all ${
              favorite
                ? "fill-gray-700 text-gray-700"
                : "text-gray-400"
            }`}
          />
        </button>
      )}
    </div>

    <div className="p-7">
      <h2 className="text-[22px] font-medium text-[#1F1F1F] mb-2">
        {property.title}
      </h2>

      <p className="text-[18px] text-gray-500">
        {property.location}
      </p>

      <div className="h-16" />

      <p className="text-[18px]">
        <span className="font-semibold text-black">
          {property.price_per_night}€
        </span>
        <span className="text-gray-500 ml-2">
          par nuit
        </span>
      </p>
    </div>
  </div>
);
}