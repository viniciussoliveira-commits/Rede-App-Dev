import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Vitrine from './Vitrine';
import Admin from './Admin';
import Login from './Login';

export default function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Esta função observa se o usuário já logou anteriormente no navegador
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-unimed-verde"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Vitrine />} />

        {/* Se estiver logado, vai pro Admin. Se não, vai pro Login */}
        <Route
          path="/admin"
          element={usuario ? <Admin /> : <Navigate to="/login" />}
        />

        {/* Se já estiver logado e tentar entrar no Login, pula direto pro Admin */}
        <Route
          path="/login"
          element={!usuario ? <Login /> : <Navigate to="/admin" />}
        />
      </Routes>
    </Router>
  );
}
