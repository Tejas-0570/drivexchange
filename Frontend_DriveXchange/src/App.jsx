import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import BrowseCars from "./pages/BrowseCars"

function App() {
  return (
   <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/browse-cars" element={<BrowseCars />}/>
   </Routes>
  )
}

export default App
