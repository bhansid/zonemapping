import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Collect from "./pages/Collect";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/collect" element={<Collect />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/collect" />} />
      </Routes>
    </BrowserRouter>
  );
}
