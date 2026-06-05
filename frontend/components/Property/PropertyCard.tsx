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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
      <div className="relative">
        <img
          src={property.cover}
          alt={property.title}
          className="w-full h-80 object-cover"
        />

        {!loading && (
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-md hover:scale-110 transition"
          >
            <Heart
              size={28}
              strokeWidth={2}
              className={`transition-all duration-200 ${
                favorite
                  ? "text-red-500 fill-red-500 scale-110"
                  : "text-gray-400 hover:text-red-400"
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {property.title}
        </h2>

        <p className="text-gray-500 mb-8">
          {property.location}
        </p>

        <p className="text-lg">
          <span className="font-bold">
            {property.price_per_night}€
          </span>
          <span className="text-gray-500 ml-1">
            / nuit
          </span>
        </p>
      </div>
    </div>
  );
}