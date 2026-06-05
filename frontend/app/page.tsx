"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import PropertyCard from "@/components/Property/PropertyCard";

export default function Home() {
  const [properties, setProperties] = useState<any[]>([]);
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    const updateLimit = () => {
      setLimit(window.innerWidth < 768 ? 6 : 12);
    };

    updateLimit();

    window.addEventListener("resize", updateLimit);

    return () => {
      window.removeEventListener("resize", updateLimit);
    };
  }, []);

  useEffect(() => {
    api.get("/api/properties").then((res) => {
      setProperties(res.data);
    });
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-bold mb-10">
        Chez vous, partout et ailleurs
      </h1>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {properties
          .slice(0, limit)
          .map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
      </div>
    </main>
  );
}