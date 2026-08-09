"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { fullUrl } from "@/lib/url";
import { useFavorites } from "@/contexts/FavoritesContext";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    cover: string;
    location: string;
    price_per_night: number;
  };
  priority?: boolean;
}

export default function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const favorite = isFavorite(property.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property); // ← on passe l'objet complet, plus juste l'id
  };

  const coverUrl = !imgError ? fullUrl(property.cover) : "/property-placeholder.jpg";

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="relative bg-gray-100">
          <img
            src={coverUrl}
            alt={property.title}
            width={400}
            height={440}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-[440px] object-cover"
          />

          {!loading && (
            <button
              onClick={handleToggleFavorite}
              aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={favorite}
              className={
                favorite
                  ? "absolute top-4 right-4 w-12 h-12 bg-[#9F3A1D] rounded-xl flex items-center justify-center hover:opacity-90 transition"
                  : "absolute top-4 right-4 w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:opacity-90 transition"
              }
            >
              <Heart
                size={18}
                className={favorite ? "fill-white text-white" : "fill-gray-500 text-gray-500"}
              />
            </button>
          )}
        </div>

        <div className="p-7">
          <h2 className="text-[22px] font-medium">{property.title}</h2>
          <p className="text-gray-500">{property.location}</p>
          <div className="h-12" />
          <p>
            <span className="font-semibold">{property.price_per_night}€</span>
            <span className="text-gray-500 ml-2">par nuit</span>
          </p>
        </div>
      </div>
    </Link>
  );
}