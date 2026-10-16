import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css'
import App from './App.jsx'
import { FavouritesProvider } from "./context/FavouritesContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavouritesProvider>
          <App />
        </FavouritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);