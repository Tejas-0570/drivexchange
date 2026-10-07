import { Link } from "react-router-dom";
import CarCard from "./CarCard";

// Swap these image paths with your own car photos
const cars = [
  {
    id: 1,
    image: "/src/images/Tesla-Model-Y.png",
    name: "Tesla Model Y",
    price: 42900,
    year: 2023,
    location: "San Francisco, CA",
    mileage: 8200,
    fuelType: "Electric",
    transmission: "Auto",
    verified: true,
  },
  {
    id: 2,
    image: "/src/images/BMW-4-Series.png",
    name: "BMW 4 Series",
    price: 38250,
    year: 2022,
    location: "Austin, TX",
    mileage: 14500,
    fuelType: "Petrol",
    transmission: "Auto",
    verified: true,
  },
  {
    id: 3,
    image: "/src/images/Ford-F-150.png",
    name: "Ford F-150",
    price: 46100,
    year: 2021,
    location: "Denver, CO",
    mileage: 22100,
    fuelType: "Diesel",
    transmission: "Auto",
    verified: true,
  },
];

const ArrowRight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="transition-transform duration-200 group-hover:translate-x-1"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function FeaturedCars() {
  return (
    <section
      id="browse"
      className="bg-[#faf8f4] px-4 py-14 font-['Manrope',system-ui,sans-serif] md:px-8"
    >
      <div className="mx-auto max-w-[1144px]">
        {/* heading row */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="font-['Fraunces',Georgia,serif] text-xl font-bold tracking-tight text-[#1c1c1e] sm:text-4xl">
            Featured Vehicles
          </h2>

          <Link
            to="/browse-cars"
            className="group inline-flex shrink-0 items-center gap-2 pb-1 text-sm font-medium text-[#1a6bff] transition-colors hover:text-[#0f5ae6]"
          >
            View all listings
            <ArrowRight />
          </Link>
        </div>

        {/* cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <div key={car.id} className="mx-auto w-full max-w-[360px]">
              <CarCard
                {...car}
                onFavouriteChange={(isFav) =>
                  console.log(car.name, "favourite:", isFav)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}