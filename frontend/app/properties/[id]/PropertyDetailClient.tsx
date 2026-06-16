"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { fullUrl } from "@/lib/url";

export default function PropertyDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    api
      .get(`/api/properties/${id}`)
      .then((res) => setProperty(res.data))
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
  ].filter(Boolean).map(fullUrl);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center px-4 py-2 bg-white rounded-xl mb-4 text-sm md:text-base hover:bg-gray-50 transition"
      >
        ← Retour
      </button>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
        <div>
          {/* Galerie */}
          <div className="space-y-3">
            <div className="lg:hidden">
              <img
                src={gallery[0]}
                alt={property.title}
                className="w-full aspect-[4/5] rounded-2xl object-cover object-[center_45%]"
              />
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {gallery.slice(1, 5).map((image: string, index: number) => (
                    <img key={index} src={image} alt=""
                      className="w-full aspect-[3/4] rounded-xl object-cover object-[center_40%]"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-3">
              <img
                src={gallery[0]}
                alt={property.title}
                className="w-full h-[600px] rounded-2xl object-cover"
              />
              <div className="grid grid-cols-2 gap-3">
                {gallery.slice(1, 5).map((image: string, index: number) => (
                  <img key={index} src={image} alt=""
                    className="h-[293px] w-full object-cover rounded-2xl"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mt-6">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">{property.title}</h1>
            <p className="text-gray-500 mb-8 md:mb-10">{property.location}</p>
            <p className="leading-7 md:leading-8 text-gray-700">{property.description}</p>

            <div className="mt-10 md:mt-12">
              <h2 className="font-semibold mb-4">Equipements</h2>
              <div className="flex flex-wrap gap-3">
                {property.equipments?.map((equipment: string) => (
                  <span key={equipment} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">{equipment}</span>
                ))}
              </div>
            </div>

            <div className="mt-10 md:mt-12">
              <h2 className="font-semibold mb-4">Catégories</h2>
              <div className="flex flex-wrap gap-3">
                {property.tags?.map((tag: string) => (
                  <span key={tag} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Host Card */}
        <aside className="bg-white rounded-2xl p-6 h-fit lg:sticky lg:top-6">
          <h2 className="font-semibold mb-6">Votre hôte</h2>
          <div className="flex items-center gap-4">
            <img
              src={fullUrl(property.host?.picture) || "/avatar-placeholder.jpg"}
              alt={property.host?.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-medium">{property.host?.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{property.rating_avg || 0}</p>
            </div>
          </div>

          <button className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 mt-8 hover:opacity-90 transition">
            Contacter l'hôte
          </button>
          <button className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 mt-3 hover:opacity-90 transition">
            Envoyer un message
          </button>
        </aside>
      </div>
    </main>
  );
}