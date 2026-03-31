import { Routes, Route, Navigate } from "react-router-dom";
import Collect from "./pages/Collect";
import Admin from "./pages/Admin";
import AgentSignup from "./pages/AgentSignup";
import Landing from "./pages/Landing";
import Header from "./components/Header";
import RegisterSale from "./pages/RegisterSale";

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/collect" element={<Collect />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/agent-signup" element={<AgentSignup />} />
        <Route path="/register-sale" element={<RegisterSale />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}