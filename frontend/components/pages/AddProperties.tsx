"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import api from "@/services/api";

const equipments: string[] = [
  "Micro-Ondes", "Douche italienne", "Frigo", "WiFi", "Parking",
  "Sèche Cheveux", "Machine à laver", "Cuisine équipée", "Télévision",
  "Chambre Séparée", "Climatisation", "Frigo Américain", "Clic-clac",
  "Four", "Rangements", "Lit", "Bouilloire", "SDB", "Toilettes sèches",
  "Cintres", "Baie vitrée", "Hotte", "Baignoire", "Vue Parc",
];

const defaultTags: string[] = [
  "Parc", "Night Life", "Culture", "Nature", "Touristique",
  "Vue sur mer", "Pour les couples", "Famille", "Forêt",
];

export default function NewPropertyPage() {
  const router = useRouter();

  // Champs texte
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [location, setLocation] = useState("");
  const [hostName, setHostName] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");

  // Images
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [pictureFiles, setPictureFiles] = useState<File[]>([]);
  const [picturePreviews, setPicturePreviews] = useState<string[]>([]);
  const [hostPictureFile, setHostPictureFile] = useState<File | null>(null);
  const [hostPicturePreview, setHostPicturePreview] = useState<string>("");

  // Équipements & tags
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEquipment = (e: string) =>
    setSelectedEquipments((prev) =>
      prev.includes(e) ? prev.filter((i) => i !== e) : [...prev, e]
    );

  const toggleTag = (t: string) =>
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((i) => i !== t) : [...prev, t]
    );

  const addCustomTag = () => {
    if (!newTag.trim()) return;
    setSelectedTags((prev) => [...prev, newTag.trim()]);
    setNewTag("");
  };

  // Upload d'une image vers l'API
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePicturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPictureFiles((prev) => [...prev, ...files]);
    setPicturePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removePicture = (index: number) => {
    setPictureFiles((prev) => prev.filter((_, i) => i !== index));
    setPicturePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHostPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHostPictureFile(file);
    setHostPicturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Le titre est obligatoire.");
    if (!pricePerNight || isNaN(Number(pricePerNight))) return setError("Le prix par nuit est obligatoire.");

    setSubmitting(true);

    try {
      // 1. Upload cover
      let coverUrl: string | undefined;
      if (coverFile) coverUrl = await uploadImage(coverFile);

      // 2. Upload pictures
      const pictureUrls: string[] = [];
      for (const file of pictureFiles) {
        const url = await uploadImage(file);
        pictureUrls.push(url);
      }

      // 3. Upload host picture
      let hostPictureUrl: string | undefined;
      if (hostPictureFile) hostPictureUrl = await uploadImage(hostPictureFile);

      // 4. Créer la propriété
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        cover: coverUrl,
        location: `${postalCode} ${location}`.trim() || undefined,
        price_per_night: Number(pricePerNight),
        host: hostName.trim()
          ? { name: hostName.trim(), picture: hostPictureUrl }
          : undefined,
        pictures: pictureUrls,
        equipments: selectedEquipments,
        tags: selectedTags,
      };

      const res = await api.post("/api/properties", payload);
      router.push(`/properties/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9]">
      <main className="py-6 px-6 lg:px-0 lg:w-[75%] lg:mx-auto">

        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          Retour
        </button>

        <form onSubmit={handleSubmit}>

          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Ajouter une propriété</h1>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#A54320] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Ajouter"}
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Ligne 1 : Infos + Images */}
          <div className="grid gap-5 lg:grid-cols-2 mb-5">

            {/* Infos logement */}
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">
                  Titre de la propriété <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Appartement cosy au coeur de paris"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Description</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre propriété en détail..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Prix par nuit (€) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="Ex : 100"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Code postal</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Localisation</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                />
              </div>
            </div>

            {/* Colonne droite */}
            <div className="flex flex-col gap-5">

              {/* Images */}
              <div className="rounded-lg bg-white p-6 shadow-sm space-y-5">

                {/* Cover */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">Image de couverture</label>
                  <div className="flex items-center gap-2">
                    {coverPreview ? (
                      <img src={coverPreview} alt="cover" className="flex-1 h-10 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="flex-1 rounded-lg border border-gray-200 bg-white h-10" />
                    )}
                    <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90 shrink-0">
                      <Plus size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    </label>
                  </div>
                </div>

                {/* Pictures */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">Images du logement</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-gray-200 bg-white h-10 overflow-hidden flex items-center gap-1 px-2">
                      {picturePreviews.length > 0 ? (
                        picturePreviews.map((src, i) => (
                          <div key={i} className="relative shrink-0">
                            <img src={src} alt="" className="h-8 w-8 rounded object-cover" />
                            <button
                              type="button"
                              onClick={() => removePicture(i)}
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-700 text-white rounded-full flex items-center justify-center"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))
                      ) : null}
                    </div>
                    <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90 shrink-0">
                      <Plus size={16} />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePicturesChange} />
                    </label>
                  </div>
                </div>

              </div>

              {/* Hôte */}
              <div className="rounded-lg bg-white p-6 shadow-sm space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-800">Nom de l'hôte</label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">Photo de profil</label>
                  <div className="flex items-center gap-2">
                    {hostPicturePreview ? (
                      <img src={hostPicturePreview} alt="host" className="flex-1 h-10 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="flex-1 rounded-lg border border-gray-200 bg-white h-10" />
                    )}
                    <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90 shrink-0">
                      <Plus size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleHostPictureChange} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ligne 2 : Équipements + Catégories */}
          <div className="grid gap-5 lg:grid-cols-2">

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-gray-900">Équipements</h2>
              <div className="grid grid-cols-2 gap-y-3">
                {equipments.map((eq) => (
                  <label key={eq} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEquipments.includes(eq)}
                      onChange={() => toggleEquipment(eq)}
                      className="accent-[#A54320]"
                    />
                    {eq}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-gray-900">Catégories</h2>
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedTags.filter(t => !defaultTags.includes(t)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="rounded-lg px-3 py-1.5 text-sm transition bg-[#A54320] text-white"
                  >
                    {tag}
                  </button>
                ))}
                {defaultTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition ${
                      selectedTags.includes(tag)
                        ? "bg-[#A54320] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <label className="mb-2 block text-sm font-medium text-gray-800">
                Ajouter une catégorie personnalisée
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                  placeholder="Nouveau tag"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}