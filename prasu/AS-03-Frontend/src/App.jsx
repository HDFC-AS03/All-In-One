import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Dashboard from "./pages/dashboard";
// 👇 1. Import the component
import UserManagement from "./pages/UserManagement"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 👇 2. Add this new independent route */}
        <Route path="/user-management" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;