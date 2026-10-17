import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import BrowseCars from "./pages/BrowseCars"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ProtectedRoute from "./components/ProtectedRoutes"
import Dashboard from "./pages/Dashboard"
import ListCar from "./pages/ListCar"
import CarDetails from "./pages/CarDetails"

function App() {
  return (
   <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/browse-cars" element={<ProtectedRoute><BrowseCars /></ProtectedRoute>}/>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/list-car" element={<ProtectedRoute><ListCar /></ProtectedRoute>} />
        <Route path="/cars/:id/edit" element={<ListCar />} />
        <Route path="/cars/:id" element={<ProtectedRoute><CarDetails /></ProtectedRoute>} />
   </Routes>
  )
}

export default App
