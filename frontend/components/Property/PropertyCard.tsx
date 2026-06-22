"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { Heart } from "lucide-react";
import { fullUrl } from "@/lib/url";

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
        `/api/users/${user.id}/favorites`
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

  const toggleFavorite = async (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Veuillez vous connecter");
        return;
      }

      if (favorite) {
        await api.delete(
          `/api/properties/${property.id}/favorite`
        );
      } else {
        await api.post(
          `/api/properties/${property.id}/favorite`
        );
      }

      setFavorite(!favorite);

      window.dispatchEvent(
        new Event("favorites-changed")
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="relative">
          <img
            src={fullUrl(property.cover)}
            alt={property.title}
            className="w-full h-[440px] object-cover"
          />

          {!loading && (
            <button
              onClick={toggleFavorite}
              className={
                favorite
                  ? "absolute top-4 right-4 w-12 h-12 bg-[#9F3A1D] rounded-xl flex items-center justify-center hover:opacity-90 transition"
                  : "absolute top-4 right-4 w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:opacity-90 transition"
              }
            >
              <Heart
                size={18}
                className={
                  favorite
                    ? "fill-white text-white"
                    : "fill-gray-500 text-gray-500"
                }
              />
            </button>
          )}
        </div>

        <div className="p-7">
          <h2 className="text-[22px] font-medium">
            {property.title}
          </h2>

          <p className="text-gray-500">
            {property.location}
          </p>

          <div className="h-12" />

          <p>
            <span className="font-semibold">
              {property.price_per_night}€
            </span>

            <span className="text-gray-500 ml-2">
              par nuit
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}