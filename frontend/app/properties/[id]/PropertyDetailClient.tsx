"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";

export default function PropertyDetailClient({
  id,
}: {
  id: string;
}) {
  const [property, setProperty] =
    useState<any>(null);

  useEffect(() => {
    api
      .get(`/api/properties/${id}`)
      .then((res) => {
        setProperty(res.data);
      })
      .catch(console.error);
  }, [id]);

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement...
      </div>
    );
  }

  const gallery = [
    property.cover,
    ...(property.pictures || []),
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center px-5 py-3 bg-white rounded-xl mb-8"
      >
        ← Retour aux annonces
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {/* Galerie */}

          <div className="grid grid-cols-12 gap-3">
            <img
              src={gallery[0]}
              alt=""
              className="
    col-span-12 md:col-span-6
    h-[280px] md:h-[500px]
    rounded-2xl
    object-cover
    w-full
  "
            />

            <div className="col-span-12 md:col-span-6">
              <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
                {gallery
                  .slice(1, 5)
                  .map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      className="
            h-24 md:h-[242px]
            w-full
            object-cover
            rounded-xl
          "
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Description */}

          <div className="bg-white rounded-2xl p-8 mt-6">
            <h1 className="text-4xl font-semibold mb-4">
              {property.title}
            </h1>

            <p className="text-gray-500 mb-10">
              📍 {property.location}
            </p>

            <p className="leading-8 text-gray-700">
              {property.description}
            </p>

            <div className="mt-12">
              <h2 className="font-semibold mb-4">
                Equipements
              </h2>

              <div className="flex flex-wrap gap-3">
                {property.equipments?.map(
                  (equipment: string) => (
                    <span
                      key={equipment}
                      className="px-4 py-2 bg-gray-100 rounded-lg"
                    >
                      {equipment}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-semibold mb-4">
                Catégories
              </h2>

              <div className="flex flex-wrap gap-3">
                {property.tags?.map(
                  (tag: string) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gray-100 rounded-lg"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Host Card */}

        <aside className="bg-white rounded-2xl p-6 h-fit sticky top-6">
          <h2 className="font-semibold mb-6">
            Votre hôte
          </h2>

          <div className="flex items-center gap-4">
            <img
              src={
                property.host?.picture ||
                "/avatar-placeholder.jpg"
              }
              alt=""
              className="w-16 h-16 rounded-xl object-cover"
            />

            <div>
              <h3 className="font-medium">
                {property.host?.name} ⭐ {property.rating_avg || 0}
              </h3>
            </div>
          </div>

          <button className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 mt-8">
            Contacter l'hôte
          </button>

          <button className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 mt-3">
            Envoyer un message
          </button>
        </aside>
      </div>
    </main>
  );
}