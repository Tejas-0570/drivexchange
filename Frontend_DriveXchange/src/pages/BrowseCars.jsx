import React from "react";
import Navbar from "../components/Navbar";

const BrowseCars = () => {
  return (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      <Navbar />

      <main className="mx-auto max-w-[1144px] px-4 py-14 md:px-8">
        <h1 className="font-['Fraunces',Georgia,serif] text-4xl font-bold tracking-tight text-[#1c1c1e]">
          Browse Cars
        </h1>
        <p className="mt-3 text-base text-[#8c8c8c]">
          All verified listings will appear here.
        </p>

        {/* TODO: filters + grid of <CarCard /> goes here */}
      </main>
    </div>
  );
};

export default BrowseCars;