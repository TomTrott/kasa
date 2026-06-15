"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

const equipments: string[] = [
  "Micro-Ondes",
  "Douche italienne",
  "Frigo",
  "WiFi",
  "Parking",
  "Sèche Cheveux",
  "Machine à laver",
  "Cuisine équipée",
  "Télévision",
  "Chambre Séparée",
  "Climatisation",
  "Frigo Américain",
  "Clic-clac",
  "Four",
  "Rangements",
  "Lit",
  "Bouilloire",
  "SDB",
  "Toilettes sèches",
  "Cintres",
  "Baie vitrée",
  "Hotte",
  "Baignoire",
  "Vue Parc",
];

const defaultTags: string[] = [
  "Parc",
  "Night Life",
  "Culture",
  "Nature",
  "Touristique",
  "Vue sur mer",
  "Pour les couples",
  "Famille",
  "Forêt",
];

export default function NewPropertyPage() {
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(equipment)
        ? prev.filter((item) => item !== equipment)
        : [...prev, equipment]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (!newTag.trim()) return;

    setSelectedTags((prev) => [...prev, newTag.trim()]);
    setNewTag("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const payload = {
      equipments: selectedEquipments,
      tags: selectedTags,
    };

    console.log(payload);

    // await api.post("/api/properties", payload)
  };

  return (
    <main className="min-h-screen bg-[#faf8f8] px-4 py-6 lg:px-12">
      <button
        type="button"
        className="mb-8 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm shadow-sm"
      >
        <ArrowLeft size={16} />
        Retour aux annonces
      </button>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold lg:text-3xl">
            Ajouter une propriété
          </h1>

          <button
            type="submit"
            className="rounded-lg bg-[#A54320] px-6 py-2 text-white hover:opacity-90"
          >
            Ajouter
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Infos logement */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Titre de la propriété
                </label>

                <input
                  type="text"
                  placeholder="Ex : Appartement cosy au coeur de paris"
                  className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-[#A54320]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  rows={5}
                  placeholder="Décrivez votre propriété en détail..."
                  className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-[#A54320]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Code postal
                </label>

                <input
                  type="text"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Localisation
                </label>

                <input
                  type="text"
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>
          </div>

          {/* Colonne droite */}

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Image de couverture
                  </span>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white">
                    <Plus size={18} />

                    <input
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Image du logement
                  </span>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white">
                    <Plus size={18} />

                    <input
                      multiple
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm text-[#A54320]"
                >
                  + Ajouter une image
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nom de l'hôte
                  </label>

                  <input
                    type="text"
                    className="w-full rounded-lg border p-3"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Photo de profil
                  </span>

                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white">
                    <Plus size={18} />

                    <input
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm text-[#A54320]"
                >
                  + Ajouter une image
                </button>
              </div>
            </div>
          </div>

          {/* Equipements */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 font-semibold">
              Équipements
            </h2>

            <div className="grid grid-cols-2 gap-y-4">
              {equipments.map((equipment) => (
                <label
                  key={equipment}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedEquipments.includes(
                      equipment
                    )}
                    onChange={() =>
                      toggleEquipment(equipment)
                    }
                  />

                  {equipment}
                </label>
              ))}
            </div>
          </div>

          {/* Catégories */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 font-semibold">
              Catégories
            </h2>

            <div className="mb-6 flex flex-wrap gap-2">
              {defaultTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-md px-3 py-2 text-sm transition ${
                    selectedTags.includes(tag)
                      ? "bg-[#A54320] text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <label className="mb-3 block font-medium">
              Ajouter une catégorie personnalisée
            </label>

            <div className="flex gap-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) =>
                  setNewTag(e.target.value)
                }
                placeholder="Nouveau tag"
                className="flex-1 rounded-lg border p-3"
              />

              <button
                type="button"
                onClick={addCustomTag}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#A54320] text-white"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              type="button"
              className="mt-4 text-sm text-[#A54320]"
            >
              + Ajouter un tag
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}