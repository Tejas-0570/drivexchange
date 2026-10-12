import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import BrowseCars from "./pages/BrowseCars"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ProtectedRoute from "./components/ProtectedRoutes"
import Dashboard from "./pages/Dashboard"
import ListCar from "./pages/ListCar"

function App() {
  return (
   <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/browse-cars" element={<BrowseCars />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/list-car" element={<ProtectedRoute><ListCar /></ProtectedRoute>} />
   </Routes>
  )
}

export default App
