"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { fullUrl } from "@/lib/url";
import starIcon from "../../../assets/images/Star.png";

export default function PropertyDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [startingConv, setStartingConv] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    api
      .get(`/api/properties/${id}`)
      .then((res) => setProperty(res.data))
      .catch(console.error);
  }, [id]);

  const handleStartConversation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setStartingConv(true);

      const res = await api.post("/api/conversations", {
        recipient_id: property.host?.id,
      });

      router.push(`/chat?conv=${res.data.conversationId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setStartingConv(false);
    }
  };

  const gallery: string[] = property
    ? [property.cover, ...(property.pictures || [])].filter(Boolean).map(fullUrl)
    : [];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null) return current;
      return (current - 1 + gallery.length) % gallery.length;
    });
  }, [gallery.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null) return current;
      return (current + 1) % gallery.length;
    });
  }, [gallery.length]);

  // Navigation clavier dans la lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showPrev, showNext]);

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement...
      </div>
    );
  }

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
                onClick={() => openLightbox(0)}
                className="w-full aspect-[4/5] rounded-2xl object-cover object-[center_45%] cursor-pointer"
              />
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {gallery.slice(1, 5).map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      onClick={() => openLightbox(index + 1)}
                      className="w-full aspect-[3/4] rounded-xl object-cover object-[center_40%] cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-3">
              <img
                src={gallery[0]}
                alt={property.title}
                onClick={() => openLightbox(0)}
                className="w-full h-[600px] rounded-2xl object-cover cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-3">
                {gallery.slice(1, 5).map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt=""
                    onClick={() => openLightbox(index + 1)}
                    className="h-[293px] w-full object-cover rounded-2xl cursor-pointer"
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
            <div className="flex items-center justify-between flex-1 gap-3">
              <h3 className="font-medium">{property.host?.name}</h3>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-1.5 w-fit">
                <img
                  src={starIcon.src}
                  alt="Note"
                  className="w-4 h-4 object-contain"
                />
                <span className="text-sm font-medium">{property.rating_avg || 0}</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 mt-8 hover:opacity-90 transition">
            Contacter l'hôte
          </button>

          <button
            onClick={handleStartConversation}
            disabled={startingConv}
            className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 mt-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {startingConv ? "Redirection..." : "Envoyer un message"}
          </button>
        </aside>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
          onClick={closeLightbox}
        >
          {/* Bouton fermer */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Fermer"
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
          >
            ×
          </button>

          {/* Compteur */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 text-white/80 text-sm font-medium">
            {lightboxIndex + 1} / {gallery.length}
          </div>

          {/* Flèche précédente */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Image précédente"
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition text-2xl"
            >
              ‹
            </button>
          )}

          {/* Image en grand */}
          <img
            key={lightboxIndex}
            src={gallery[lightboxIndex]}
            alt={property.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg animate-[fadeScaleIn_0.25s_ease-out]"
          />

          {/* Flèche suivante */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Image suivante"
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition text-2xl"
            >
              ›
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  );
}