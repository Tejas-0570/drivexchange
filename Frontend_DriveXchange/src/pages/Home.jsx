import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import FeaturedCars from '../components/FeaturedCars'
import LandingPageDescription from '../components/LandingPageDescription'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturedCars />
      <LandingPageDescription />
      <Footer />  
    </div>
  )
}

export default Home