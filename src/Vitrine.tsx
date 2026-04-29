import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import {
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Clock,
  Folder,
  ArrowLeft,
  Search,
  Filter,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const UnimedLogo = ({ size = 42, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 552 552"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(0,276) scale(0.1,-0.1)" fill={color} stroke="none">
      <path d="m3449 1267 c24 -12 54 -50 531 -682 145 -192 359 -476 476 -631 117 -155 216 -292 219 -305 3 -14 0 -32 -9 -44 -14 -19 -29 -20 -350 -25 -295 -4 -337 -7 -352 -22 -11 -11 -14 -24 -10 -40 3 -12 119 -175 256 -361 138 -186 253 -350 256 -364 5 -18 1 -31 -15 -46 -21 -22 -26 -22 -462 -25 -383 -2 -444 -1 -472 13 -20 10 -60 54 -107 118 -41 56 -122 167 -181 247 -245 331 -298 405 -302 422 -12 42 13 48 214 48 176 0 190 1 209 20 11 11 20 29 20 40 0 16 -162 240 -450 621 -81 107 -85 115 -65 145 l15 24 205 0 c237 0 274 8 275 62 0 10 -115 171 -256 358 -234 310 -260 341 -295 352 -30 8 -48 8 -78 0 -35 -11 -61 -42 -288 -345 -137 -182 -253 -341 -256 -351 -12 -30 1 -53 35 -65 18 -7 114 -11 233 -11 189 0 203 -1 220 -20 15 -16 16 -25 8 -43 -6 -13 -126 -178 -267 -366 -141 -189 -256 -351 -256 -360 0 -10 6 -26 14 -37 13 -17 31 -19 216 -24 215 -5 228 -9 210 -56 -7 -19 -160 -230 -345 -476 -27 -37 -86 -117 -130 -177 -44 -61 -93 -117 -110 -126 -27 -14 -80 -16 -471 -13 -424 3 -443 4 -464 23 -16 14 -20 27 -16 47 3 15 58 99 123 186 429 580 410 550 380 580 -16 15 -52 18 -353 22 -318 5 -336 6 -350 24 -8 11 -14 25 -14 30 0 19 39 76 214 314 94 129 187 255 206 282 38 53 236 324 552 757 140 190 207 275 226 282 43 15 1381 14 1411 -2z" />
    </g>
  </svg>
);

export const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => (
  <button
    onClick={() => setIsDarkMode(!isDarkMode)}
    className={`relative w-[64px] h-[32px] rounded-full p-1 flex items-center transition-colors duration-500 shadow-inner focus:outline-none ${
      isDarkMode
        ? 'bg-[#222] border border-[#333]'
        : 'bg-[#e5e5e5] border border-transparent'
    }`}
  >
    <Sun
      size={14}
      className={`absolute left-2.5 transition-all duration-500 ${
        isDarkMode
          ? 'opacity-0 scale-50'
          : 'opacity-100 scale-100 text-[#1a1a18]'
      }`}
    />
    <Moon
      size={14}
      className={`absolute right-2.5 transition-all duration-500 ${
        isDarkMode ? 'opacity-100 scale-100 text-white' : 'opacity-0 scale-50'
      }`}
    />
    <div
      className={`w-[24px] h-[24px] rounded-full shadow-md transition-transform duration-500 z-10 ${
        isDarkMode
          ? 'bg-[#444] translate-x-[30px]'
          : 'bg-[#1a1a18] translate-x-[32px]'
      }`}
      style={{ transform: isDarkMode ? 'translateX(0)' : 'translateX(30px)' }}
    />
  </button>
);

export default function Vitrine() {
  const [pastas, setPastas] = useState([]);
  const [ferramentas, setFerramentas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [pastaAtiva, setPastaAtiva] = useState(null);
  const [ferramentaAtiva, setFerramentaAtiva] = useState(null);
  const [sidebarAberta, setSidebarAberta] = useState(true);

  const [pesquisaInput, setPesquisaInput] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');

  const searchContainerRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  const [recentesIds, setRecentesIds] = useState(() => {
    const salvos = localStorage.getItem('recentes');
    return salvos ? JSON.parse(salvos) : [];
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const buscar = async () => {
      const pSnap = await getDocs(collection(db, 'pastas'));
      setPastas(
        pSnap.docs
          .map((d) => ({ id: d.id, ordem: 999, ...d.data() }))
          .sort((a, b) => a.ordem - b.ordem)
      );

      const fSnap = await getDocs(collection(db, 'ferramentas'));
      setFerramentas(
        fSnap.docs
          .map((d) => ({ id: d.id, ordem: 999, ...d.data() }))
          .filter((f) => f.ativo)
          .sort((a, b) => a.ordem - b.ordem)
      );

      setCarregando(false);
    };
    buscar();
  }, []);

  useEffect(() => {
    const handleClickFora = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setMostrarSugestoes(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const ferramentasRecentes = recentesIds
    .map((id) => ferramentas.find((f) => f.id === id))
    .filter(Boolean);

  const selecionarFerramenta = (item) => {
    const novosRecentes = [
      item.id,
      ...recentesIds.filter((id) => id !== item.id),
    ].slice(0, 3);
    setRecentesIds(novosRecentes);
    localStorage.setItem('recentes', JSON.stringify(novosRecentes));

    let vaiAbrirEmNovaAba = item.abrirEmNovaAba;

    if (vaiAbrirEmNovaAba === undefined) {
      const url = item.urlDestino.toLowerCase();
      vaiAbrirEmNovaAba =
        url.includes('docs.google.com') ||
        url.includes('sheets') ||
        url.includes('tableau') ||
        url.includes('lookerstudio') ||
        url.includes('datastudio') ||
        url.includes('powerbi');
    }

    if (vaiAbrirEmNovaAba) {
      window.open(item.urlDestino, '_blank');
    } else {
      setFerramentaAtiva(item);
    }

    setMostrarSugestoes(false);
  };

  const irParaHome = () => {
    setPastaAtiva(null);
    setFerramentaAtiva(null);
    setBuscaAplicada('');
    setPesquisaInput('');
    setCategoriaAtiva('');
  };

  const clicarNoMenuLateral = (pasta) => {
    if (pasta.isLinkDireto) {
      let vaiAbrirEmNovaAba = pasta.abrirEmNovaAba;

      if (vaiAbrirEmNovaAba === undefined) {
        const url = (pasta.urlDestino || '').toLowerCase();
        vaiAbrirEmNovaAba =
          url.includes('docs.google.com') ||
          url.includes('sheets') ||
          url.includes('tableau') ||
          url.includes('lookerstudio') ||
          url.includes('datastudio') ||
          url.includes('powerbi');
      }

      if (vaiAbrirEmNovaAba) {
        window.open(pasta.urlDestino, '_blank');
      } else {
        // Marca como Link Direto para o renderizador saber que deve ocultar o título
        setFerramentaAtiva({
          id: pasta.id,
          titulo: pasta.nome,
          categoria: 'Acesso Rápido',
          urlDestino: pasta.urlDestino,
          isLinkDireto: true,
        });
        setPastaAtiva(null);
      }
    } else {
      setPastaAtiva(pasta);
      setFerramentaAtiva(null);
      setBuscaAplicada('');
      setPesquisaInput('');
      setCategoriaAtiva('');
    }
  };

  const handleKeyDownPesquisa = (e) => {
    if (e.key === 'Enter') {
      setBuscaAplicada(pesquisaInput);
      setMostrarSugestoes(false);
    }
  };

  const obterFerramentasAgrupadas = () => {
    if (!pastaAtiva)
      return { grupos: {}, categoriasOrdenadas: [], categoriasUnicas: [] };

    let ferramentasDaPasta = ferramentas.filter(
      (f) => f.pastaId === pastaAtiva.id
    );

    const categoriasUnicas = Array.from(
      new Set(ferramentasDaPasta.map((f) => f.categoria || 'Outros'))
    ).sort();

    if (categoriaAtiva) {
      ferramentasDaPasta = ferramentasDaPasta.filter(
        (f) => (f.categoria || 'Outros') === categoriaAtiva
      );
    }

    if (buscaAplicada) {
      const termo = buscaAplicada.toLowerCase();
      ferramentasDaPasta = ferramentasDaPasta.filter(
        (f) =>
          f.titulo.toLowerCase().includes(termo) ||
          (f.categoria || '').toLowerCase().includes(termo) ||
          (f.descricao || '').toLowerCase().includes(termo)
      );
    }

    const grupos = ferramentasDaPasta.reduce((acc, ferramenta) => {
      const categoria = ferramenta.categoria || 'Outros';
      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(ferramenta);
      return acc;
    }, {});

    const categoriasOrdenadas = Object.keys(grupos).sort(
      (a, b) => grupos[a][0].ordem - grupos[b][0].ordem
    );

    return { grupos, categoriasOrdenadas, categoriasUnicas };
  };

  const {
    grupos: ferramentasAgrupadas = {},
    categoriasOrdenadas = [],
    categoriasUnicas = [],
  } = obterFerramentasAgrupadas();

  const obterSugestoes = () => {
    if (!pesquisaInput.trim() || !pastaAtiva) return [];
    const termo = pesquisaInput.toLowerCase();
    return ferramentas
      .filter(
        (f) =>
          f.pastaId === pastaAtiva.id &&
          (f.titulo.toLowerCase().includes(termo) ||
            (f.categoria || '').toLowerCase().includes(termo) ||
            (f.descricao || '').toLowerCase().includes(termo))
      )
      .slice(0, 5);
  };
  const sugestoes = obterSugestoes();

  if (carregando)
    return (
      <div
        className={`h-screen flex items-center justify-center transition-colors duration-500 ${
          isDarkMode ? 'bg-[#121212]' : 'bg-white'
        }`}
      >
        <div className="w-12 h-12 border-4 border-[#ece9e3] border-t-[#c9a84c] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div
      className={`flex h-screen font-sans overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? 'bg-[#121212] text-[#e4e4e7]'
          : 'bg-[#f8f7f4] text-[#1a1a18]'
      }`}
    >
      <aside
        className={`relative ${
          sidebarAberta ? 'w-[240px]' : 'w-[80px]'
        } transition-colors duration-500 flex flex-col z-20 shadow-2xl shrink-0 ${
          isDarkMode ? 'bg-[#141414] border-r border-[#27272a]' : 'bg-[#004e4c]'
        }`}
      >
        <button
          onClick={() => setSidebarAberta(!sidebarAberta)}
          className={`absolute -right-3.5 top-10 w-7 h-7 rounded-full flex items-center justify-center shadow-card border transition-colors z-50 ${
            isDarkMode
              ? 'bg-[#27272a] border-[#3f3f46] text-white hover:text-[#004e4c]'
              : 'bg-white border-[#ece9e3] text-[#004e4c] hover:text-[#c9a84c]'
          }`}
        >
          {sidebarAberta ? (
            <ChevronLeft size={16} strokeWidth={2.5} />
          ) : (
            <ChevronRight size={16} strokeWidth={2.5} />
          )}
        </button>

        <button
          onClick={irParaHome}
          className={`w-full p-6 flex items-center ${
            sidebarAberta ? 'gap-4' : 'justify-center'
          } border-b ${
            isDarkMode ? 'border-[#27272a]' : 'border-white/10'
          } hover:bg-white/5 transition-colors text-left focus:outline-none`}
          title="Voltar ao início"
        >
          <UnimedLogo size={42} color="white" />
          {sidebarAberta && (
            <div className="flex flex-col">
              <span className={`font-serif text-2xl leading-none text-white`}>
                Rede<span className="text-[#c9a84c]">.</span>
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  isDarkMode ? 'text-[#71717a]' : 'text-white/70'
                }`}
              >
                Ambulatorial
              </span>
            </div>
          )}
        </button>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {pastas.map((pasta) => {
            const IconePasta =
              LucideIcons[pasta.nomeIcone] || LucideIcons.LayoutDashboard;
            const ativa =
              (pastaAtiva?.id === pasta.id && !ferramentaAtiva) ||
              (pasta.isLinkDireto && ferramentaAtiva?.id === pasta.id);

            return (
              <button
                key={pasta.id}
                onClick={() => clicarNoMenuLateral(pasta)}
                className={`w-full flex items-center ${
                  sidebarAberta ? 'gap-4' : 'justify-center'
                } p-3.5 rounded-xl transition-all text-left group ${
                  ativa
                    ? `bg-white/10 border-l-[5px] border-[#c9a84c]`
                    : `hover:bg-white/5`
                }`}
              >
                <IconePasta
                  size={20}
                  strokeWidth={ativa ? 2.5 : 2}
                  className={`text-white transition-opacity ${
                    ativa ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                  }`}
                />
                {sidebarAberta && (
                  <p
                    className={`text-[14px] font-bold tracking-tight truncate leading-tight text-white transition-opacity ${
                      ativa
                        ? 'opacity-100'
                        : 'opacity-75 group-hover:opacity-100'
                    }`}
                  >
                    {pasta.nome}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col">
          <Link
            to="/login"
            className={`p-6 border-t ${
              isDarkMode ? 'border-[#27272a]' : 'border-white/10'
            } flex items-center ${
              sidebarAberta ? 'gap-4' : 'justify-center'
            } transition-all font-bold group`}
          >
            <Settings
              size={22}
              className="text-white opacity-40 group-hover:opacity-100 transition-opacity"
            />
            {sidebarAberta && (
              <span className="text-[12px] uppercase tracking-widest text-white opacity-40 group-hover:opacity-100 transition-opacity">
                Configurações
              </span>
            )}
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-8 right-10 z-10 animate-fadeIn">
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        </div>

        {ferramentaAtiva ? (
          <div className="flex-1 flex flex-col animate-fadeIn h-full bg-white dark:bg-[#121212]">
            {/* O CABEÇALHO SÓ APARECE SE NÃO FOR LINK DIRETO */}
            {!ferramentaAtiva.isLinkDireto && (
              <header
                className={`h-16 px-8 flex justify-between items-center shadow-sm transition-colors duration-500 border-b ${
                  isDarkMode
                    ? 'bg-[#18181b] border-[#27272a]'
                    : 'bg-white border-[#ece9e3]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setFerramentaAtiva(null)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode
                        ? 'hover:bg-[#27272a] text-[#71717a] hover:text-white'
                        : 'hover:bg-[#f0eee9] text-[#9a9788] hover:text-[#004e4c]'
                    }`}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2
                    className={`font-serif text-xl ${
                      isDarkMode ? 'text-white' : 'text-[#004e4c]'
                    }`}
                  >
                    {ferramentaAtiva.titulo}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      isDarkMode
                        ? 'bg-[#27272a] text-[#a1a1aa]'
                        : 'badge-premium shadow-sm'
                    }`}
                  >
                    {ferramentaAtiva.categoria}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-[100px]"></div>
                  <button
                    onClick={() =>
                      window.open(ferramentaAtiva.urlDestino, '_blank')
                    }
                    className={`btn btn-sm font-bold transition-colors ${
                      isDarkMode
                        ? 'bg-[#27272a] text-white hover:bg-[#004e4c]'
                        : 'btn-ghost hover:border-[#c9a84c] hover:text-[#c9a84c]'
                    }`}
                  >
                    Expandir <ExternalLink size={16} />
                  </button>
                </div>
              </header>
            )}

            {/* IFRAME: Se for Link Direto, ganha um pt-16 (padding-top) para afastar a tela do botão de Dark Mode */}
            <div
              className={`flex-1 p-6 transition-colors duration-500 ${
                isDarkMode ? 'bg-[#121212]' : 'bg-[#f8f7f4]'
              } ${ferramentaAtiva.isLinkDireto ? 'pt-16' : ''}`}
            >
              <div
                className={`w-full h-full rounded-2xl overflow-hidden border transition-colors duration-500 ${
                  isDarkMode
                    ? 'bg-[#18181b] border-[#27272a] shadow-none'
                    : 'bg-white border-[#ece9e3] shadow-card'
                }`}
              >
                <iframe
                  src={ferramentaAtiva.urlDestino}
                  className="w-full h-full border-none"
                  title={ferramentaAtiva.titulo}
                />
              </div>
            </div>
          </div>
        ) : pastaAtiva ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-14 animate-fadeIn">
            <div className="w-full max-w-[1400px] mr-auto">
              <div className="mb-10">
                <h2
                  className={`font-serif text-4xl mb-3 flex items-center gap-4 ${
                    isDarkMode ? 'text-white' : 'text-[#004e4c]'
                  }`}
                >
                  {(() => {
                    const Icone =
                      LucideIcons[pastaAtiva.nomeIcone] ||
                      LucideIcons.LayoutDashboard;
                    return <Icone size={36} className="text-[#c9a84c]" />;
                  })()}
                  {pastaAtiva.nome}
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'
                  }`}
                >
                  Selecione um dos recursos abaixo para acessar ou busque
                  rapidamente.
                </p>
              </div>

              <div className="flex flex-col xl:flex-row gap-6 mb-12 items-start xl:items-center">
                <div
                  className="relative w-full xl:w-[400px]"
                  ref={searchContainerRef}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search
                      size={18}
                      className={
                        isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'
                      }
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquise por título, categoria ou contexto..."
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none font-medium transition-all ${
                      isDarkMode
                        ? 'bg-[#1c1c20] border-[#27272a] text-white focus:border-[#00a8a3] focus:ring-1 focus:ring-[#00a8a3]/30'
                        : 'bg-white border-[#ece9e3] focus:border-[#004e4c] focus:ring-1 focus:ring-[#004e4c]/20 shadow-sm'
                    }`}
                    value={pesquisaInput}
                    onChange={(e) => {
                      setPesquisaInput(e.target.value);
                      setMostrarSugestoes(true);
                      if (e.target.value === '') setBuscaAplicada('');
                    }}
                    onKeyDown={handleKeyDownPesquisa}
                  />

                  {mostrarSugestoes && pesquisaInput.length > 0 && (
                    <div
                      className={`absolute top-full left-0 w-full mt-2 rounded-xl border shadow-xl z-50 overflow-hidden animate-fadeIn ${
                        isDarkMode
                          ? 'bg-[#1c1c20] border-[#27272a]'
                          : 'bg-white border-[#ece9e3]'
                      }`}
                    >
                      {sugestoes.length > 0 ? (
                        <div className="py-2">
                          <p
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${
                              isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'
                            }`}
                          >
                            Sugestões (Pressione Enter para ver tudo)
                          </p>
                          {sugestoes.map((sug) => {
                            const Icone =
                              LucideIcons[
                                sug.nomeIcone ||
                                  pastaAtiva.nomeIcone ||
                                  'LayoutDashboard'
                              ] || LucideIcons.LayoutDashboard;
                            return (
                              <button
                                key={sug.id}
                                onClick={() => selecionarFerramenta(sug)}
                                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                                  isDarkMode
                                    ? 'hover:bg-[#27272a]'
                                    : 'hover:bg-[#faf9f5]'
                                }`}
                              >
                                <Icone
                                  size={16}
                                  className={
                                    isDarkMode
                                      ? 'text-[#00a8a3]'
                                      : 'text-[#004e4c]'
                                  }
                                />
                                <div className="flex-1 truncate">
                                  <span
                                    className={`text-sm font-bold block ${
                                      isDarkMode
                                        ? 'text-white'
                                        : 'text-[#1a1a18]'
                                    }`}
                                  >
                                    {sug.titulo}
                                  </span>
                                  <span
                                    className={`text-[10px] ${
                                      isDarkMode
                                        ? 'text-[#71717a]'
                                        : 'text-[#5a5a52]'
                                    }`}
                                  >
                                    {sug.categoria}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className={`px-4 py-4 text-sm text-center ${
                            isDarkMode ? 'text-[#71717a]' : 'text-[#5a5a52]'
                          }`}
                        >
                          Nenhum resultado encontrado.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {categoriasUnicas.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full">
                    <Filter
                      size={16}
                      className={`shrink-0 mr-2 ${
                        isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'
                      }`}
                    />
                    <button
                      onClick={() => setCategoriaAtiva('')}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        categoriaAtiva === ''
                          ? isDarkMode
                            ? 'bg-[#00a8a3] text-white border-[#00a8a3]'
                            : 'bg-[#004e4c] text-white border-[#004e4c]'
                          : isDarkMode
                          ? 'bg-[#1c1c20] text-[#a1a1aa] border-[#27272a] hover:bg-[#27272a]'
                          : 'bg-white text-[#5a5a52] border-[#ece9e3] hover:bg-[#faf9f5]'
                      }`}
                    >
                      Todos
                    </button>
                    {categoriasUnicas.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoriaAtiva(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                          categoriaAtiva === cat
                            ? isDarkMode
                              ? 'bg-[#00a8a3] text-white border-[#00a8a3]'
                              : 'bg-[#004e4c] text-white border-[#004e4c]'
                            : isDarkMode
                            ? 'bg-[#1c1c20] text-[#a1a1aa] border-[#27272a] hover:bg-[#27272a]'
                            : 'bg-white text-[#5a5a52] border-[#ece9e3] hover:bg-[#faf9f5]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {buscaAplicada && (
                <div
                  className={`mb-8 p-4 rounded-xl flex items-center justify-between border ${
                    isDarkMode
                      ? 'bg-[#1c1c20] border-[#27272a]'
                      : 'bg-[#e8f5f4] border-[#004e4c]/20'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-[#004e4c]'
                    }`}
                  >
                    Exibindo resultados para:{' '}
                    <strong className="font-black">"{buscaAplicada}"</strong>
                  </p>
                  <button
                    onClick={() => {
                      setBuscaAplicada('');
                      setPesquisaInput('');
                    }}
                    className={`text-xs font-bold uppercase tracking-widest ${
                      isDarkMode
                        ? 'text-[#00a8a3] hover:text-white'
                        : 'text-[#004e4c] hover:underline'
                    }`}
                  >
                    Limpar Pesquisa
                  </button>
                </div>
              )}

              <div className="transition-all duration-500 ease-in-out">
                {categoriasOrdenadas.map((categoria) => (
                  <div key={categoria} className="mb-12 animate-fadeIn">
                    <div className="flex items-center gap-4 mb-6">
                      <h3
                        className={`font-bold text-xs uppercase tracking-widest whitespace-nowrap ${
                          isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'
                        }`}
                      >
                        {categoria}
                      </h3>
                      <div
                        className={`flex-1 border-t border-dashed ${
                          isDarkMode ? 'border-[#27272a]' : 'border-[#d4d4d8]'
                        }`}
                      ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {ferramentasAgrupadas[categoria].map((item) => {
                        const nomeIconeFinal =
                          item.nomeIcone ||
                          pastaAtiva.nomeIcone ||
                          'LayoutDashboard';
                        const Icone =
                          LucideIcons[nomeIconeFinal] ||
                          LucideIcons.LayoutDashboard;

                        return (
                          <button
                            key={item.id}
                            onClick={() => selecionarFerramenta(item)}
                            className={`flex flex-col text-left p-6 rounded-[20px] border transition-all duration-300 transform group ${
                              isDarkMode
                                ? 'bg-[#1c1c20] border-[#27272a] hover:border-[#00a8a3] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00a8a3]/10'
                                : 'bg-white border-[#ece9e3] hover:border-[#004e4c] hover:shadow-lg hover:-translate-y-1'
                            }`}
                          >
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
                                isDarkMode
                                  ? 'bg-[#27272a] text-[#c9a84c] group-hover:bg-[#00a8a3] group-hover:text-white'
                                  : 'bg-[#faf9f5] text-[#004e4c] group-hover:bg-[#004e4c] group-hover:text-white border border-[#ece9e3]'
                              }`}
                            >
                              <Icone size={28} strokeWidth={2} />
                            </div>
                            <h3
                              className={`font-bold text-lg leading-tight mb-2 ${
                                isDarkMode ? 'text-white' : 'text-[#1a1a18]'
                              }`}
                            >
                              {item.titulo}
                            </h3>
                            <p
                              className={`text-xs font-medium line-clamp-2 mt-auto pt-2 ${
                                isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'
                              }`}
                            >
                              {item.descricao || 'Sem descrição cadastrada.'}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {categoriasOrdenadas.length === 0 && (
                  <div
                    className={`text-center py-10 rounded-2xl border border-dashed ${
                      isDarkMode
                        ? 'border-[#27272a] bg-[#1c1c20]'
                        : 'border-[#d4d4d8] bg-[#faf9f5]'
                    }`}
                  >
                    <p
                      className={`text-sm italic font-medium ${
                        isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'
                      }`}
                    >
                      Nenhum acesso encontrado com os filtros atuais.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-10 relative">
            <div className="flex-1 min-h-[40px]"></div>
            <div className="w-full flex flex-col items-center justify-center shrink-0 animate-fadeIn">
              <div className="mb-6 flex justify-center opacity-10">
                <UnimedLogo
                  size={100}
                  color={isDarkMode ? '#c9a84c' : '#004e4c'}
                />
              </div>
              <h2
                className={`font-serif text-[48px] leading-tight mb-2 italic ${
                  isDarkMode ? 'text-white' : 'text-[#004e4c]'
                }`}
              >
                Rede<span className="text-[#c9a84c]">.</span>
              </h2>
              <p
                className={`text-[12px] font-bold uppercase tracking-[0.4em] mb-6 ${
                  isDarkMode ? 'text-[#71717a]' : 'text-[#c9a84c]'
                }`}
              >
                Ambulatorial
              </p>
              <p
                className={`text-sm font-medium max-w-md mx-auto text-center ${
                  isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'
                }`}
              >
                Selecione uma pasta no menu lateral para visualizar e acessar as
                ferramentas da rede.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-end w-full mt-16 min-h-[150px]">
              {ferramentasRecentes.length > 0 && (
                <div
                  className={`w-full max-w-4xl mx-auto animate-fadeIn border-t border-dashed pt-10 pb-4 transition-colors duration-500 ${
                    isDarkMode ? 'border-[#27272a]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <Clock
                      size={18}
                      className={
                        isDarkMode ? 'text-[#71717a]' : 'text-[#c9a84c]'
                      }
                    />
                    <h3
                      className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                        isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'
                      }`}
                    >
                      Acessados Recentemente
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {ferramentasRecentes.map((item) => {
                      const pastaPai = pastas.find(
                        (p) => p.id === item.pastaId
                      );
                      const nomeIconeFinal =
                        item.nomeIcone ||
                        pastaPai?.nomeIcone ||
                        'LayoutDashboard';
                      const Icone =
                        LucideIcons[nomeIconeFinal] ||
                        LucideIcons.LayoutDashboard;

                      return (
                        <button
                          key={item.id}
                          onClick={() => selecionarFerramenta(item)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group w-full ${
                            isDarkMode
                              ? 'bg-[#1c1c20] border-[#27272a] hover:border-[#00a8a3] hover:bg-[#202024]'
                              : 'bg-white border-[#ece9e3] hover:border-[#004e4c] shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                              isDarkMode
                                ? 'bg-[#27272a] text-[#c9a84c] group-hover:bg-[#00a8a3] group-hover:text-white'
                                : 'bg-[#faf9f5] text-[#c9a84c] group-hover:bg-[#004e4c] group-hover:text-white'
                            }`}
                          >
                            <Icone size={20} strokeWidth={2.5} />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p
                              className={`text-[13px] font-bold tracking-tight truncate ${
                                isDarkMode ? 'text-white' : 'text-[#004e4c]'
                              }`}
                            >
                              {item.titulo}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
