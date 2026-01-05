/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cek status login pas aplikasi pertama kali dibuka
  useEffect(() => {
    const authStatus = localStorage.getItem('biolens_auth') === 'true';
    setIsAuthenticated(authStatus);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('biolens_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (confirm("Yakin mau logout?")) {
      localStorage.removeItem('biolens_auth');
      setIsAuthenticated(false);
    }
  };

  if (loading) return null; // Atau tampilin spinner loading full screen

  return (
    <div className="antialiased text-slate-900">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;