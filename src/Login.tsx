import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UnimedLogo, ThemeToggle } from './Vitrine';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  // Estado e Efeito do Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/admin');
    } catch (err) {
      alert('Erro ao acessar o sistema. Verifique suas credenciais.');
    }
  };

  return (
    <div
      className={`min-h-screen relative flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-[#121212]' : 'bg-[#f8f7f4]'
      }`}
    >
      {/* BOTÃO MODO ESCURO FLUTUANTE */}
      <div className="absolute top-8 right-10 z-10 animate-fadeIn">
        <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>

      <div
        className={`w-full max-w-md p-10 rounded-[24px] shadow-modal transition-colors duration-500 ${
          isDarkMode ? 'bg-[#18181b] border border-[#27272a]' : 'bg-white'
        }`}
      >
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4">
            <UnimedLogo size={60} color={isDarkMode ? '#c9a84c' : '#004e4c'} />
          </div>
          <h1
            className={`text-3xl font-serif ${
              isDarkMode ? 'text-white' : 'text-[#004e4c]'
            }`}
          >
            Acesso Restrito<span className="text-[#c9a84c]">.</span>
          </h1>
          <p
            className={`text-xs font-bold uppercase tracking-widest mt-2 ${
              isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'
            }`}
          >
            Gestão Ambulatorial
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="fg">
            <label className={isDarkMode ? 'text-[#71717a]' : ''}>
              E-mail Institucional
            </label>
            <input
              type="email"
              className={`w-full p-3 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-[#121212] border-[#27272a] text-white focus:border-[#004e4c]'
                  : 'bg-white border-[#ece9e3]'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="fg">
            <label className={isDarkMode ? 'text-[#71717a]' : ''}>Senha</label>
            <input
              type="password"
              className={`w-full p-3 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-[#121212] border-[#27272a] text-white focus:border-[#004e4c]'
                  : 'bg-white border-[#ece9e3]'
              }`}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn btn-gold py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Entrar no Painel
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className={`w-full mt-8 text-[11px] font-bold uppercase tracking-widest transition-colors ${
            isDarkMode
              ? 'text-[#52525b] hover:text-white'
              : 'text-[#9a9788] hover:text-[#004e4c]'
          }`}
        >
          ← Voltar para a Vitrine
        </button>
      </div>
    </div>
  );
}
