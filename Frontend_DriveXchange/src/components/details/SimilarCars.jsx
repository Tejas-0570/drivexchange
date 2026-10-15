// src/components/details/SimilarCars.jsx
// "You might also like": other cars of the same brand (re-uses the browse search).
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CarCard from "../CarCard";
import { fetchBrowseCars } from "../../api/carApi";

export default function SimilarCars({ car }) {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);

  useEffect(() => {
    if (!car.brand) return;
    const ctrl = new AbortController();

    fetchBrowseCars({ q: car.brand, sort: "year_desc", page: 0, size: 8 }, ctrl.signal)
      .then((res) => setCars(res.items.filter((c) => c.id !== car.id).slice(0, 3)))
      .catch(() => setCars([])); // this section is optional — fail silently

    return () => ctrl.abort();
  }, [car.id, car.brand]);

  if (cars.length === 0) return null;

  return (
    <section className="mt-14" aria-label="Similar cars">
      <h2 className="font-['Fraunces',Georgia,serif] text-2xl font-bold tracking-tight text-[#1c1c1e]">
        You might also like
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((c) => (
          <div key={c.id} className="h-full">
            <CarCard
              image={c.image}
              name={c.name}
              price={c.price}
              year={c.year}
              location={c.location}
              mileage={c.mileage ?? 0}
              fuelType={c.fuelType}
              transmission={c.transmission}
              verified={c.verified}
              onClick={() => navigate(`/cars/${c.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}