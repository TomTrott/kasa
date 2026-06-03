"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function Home() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/properties").then((res) => {
      setProperties(res.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Trouve ton logement</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={p.cover}
              className="h-48 w-full object-cover"
              alt={p.title}
            />

            <div className="p-4">
              <h2 className="font-semibold text-lg">{p.title}</h2>
              <p className="text-gray-500 text-sm">{p.location}</p>
              <p className="mt-2 font-bold text-red-500">{p.price_per_night || "Prix non défini"} € / nuit</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}