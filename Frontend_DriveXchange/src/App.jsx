import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import BrowseCars from "./pages/BrowseCars"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ProtectedRoute from "./components/ProtectedRoutes"
import Dashboard from "./pages/Dashboard"
import ListCar from "./pages/ListCar"
import CarDetails from "./pages/CarDetails"
import OrderPage from "./pages/OrderPage"
import AdminRoute from "./components/admin/AdminRoute"
import AdminLayout from "./pages/admin/AdminLayout"
import AdminOverview from "./pages/admin/AdminOverview"
import AdminListings from "./pages/admin/AdminListings"
import AdminListingDetail from "./pages/admin/AdminListingDetail"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminOrderDetail from "./pages/admin/AdminOrderDetail"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminUserDetail from "./pages/admin/AdminUserDetail"
import AdminActivity from "./pages/admin/AdminActivity"

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
        <Route path="/transactions/:id" element={<ProtectedRoute><OrderPage /></ProtectedRoute>}/>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="listings/:id" element={<AdminListingDetail />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="activity" element={<AdminActivity />} />
        </Route>

    </Routes>
  )
}

export default App
