import { Routes, Route, Navigate } from "react-router-dom";
import Collect from "./pages/Collect";
import Admin from "./pages/Admin";
import AgentSignup from "./pages/AgentSignup";
import Header from "./components/Header";

export default function App() {
  return (
    <>
      <Header />

      <Routes>
      <Route path="/collect" element={<Collect />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/collect" />} />
      <Route path="/agent-signup" element={<AgentSignup />} />
    </Routes>
    </>
  );
}
