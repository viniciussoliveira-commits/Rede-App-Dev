import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import { Trash2, Edit3, Plus, Save, X, ArrowLeft, FolderPlus, GripVertical, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './Vitrine';

const ICONES_SISTEMA = [
  'AlertCircle', 
  'DollarSign', 'Handshake', 'Briefcase', 
  'Stethoscope', 'HeartPulse', 'Hospital', 'Activity', 'Users', 'HeartHandshake', 'Thermometer', 'ClipboardList',
  'LayoutDashboard', 'PieChart', 'BarChart3', 'TrendingUp', 'LineChart', 'Target'
];

export default function Admin() {
  const [ferramentas, setFerramentas] = useState([]);
  const [pastas, setPastas] = useState([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPastaModalOpen, setIsPastaModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ titulo: '', descricao: '', pastaId: '', categoria: '', urlDestino: '', nomeIcone: '', ativo: true, ordem: 999, abrirEmNovaAba: false });
  const [novaPasta, setNovaPasta] = useState({ id: null, nome: '', nomeIcone: 'LayoutDashboard', ordem: 999, isLinkDireto: false, urlDestino: '', abrirEmNovaAba: false });

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const dragPastaItem = useRef(null);
  const dragPastaOverItem = useRef(null);

  const dragToolItem = useRef(null);
  const dragToolOverItem = useRef(null);

  useEffect(() => { localStorage.setItem('theme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);

  const carregarDados = async () => {
    const pSnap = await getDocs(collection(db, "pastas"));
    setPastas(pSnap.docs.map(d => ({ id: d.id, ordem: 999, ...d.data() })).sort((a, b) => a.ordem - b.ordem));

    const fSnap = await getDocs(collection(db, "ferramentas"));
    setFerramentas(fSnap.docs.map(d => ({ id: d.id, ordem: 999, ...d.data() })));
  };

  useEffect(() => { carregarDados(); }, []);

  const handleSortPasta = async (e) => {
    e.stopPropagation();
    if (dragPastaItem.current === null || dragPastaOverItem.current === null) return;
    
    let _pastas = [...pastas];
    const draggedItem = _pastas.splice(dragPastaItem.current, 1)[0];
    _pastas.splice(dragPastaOverItem.current, 0, draggedItem);
    
    dragPastaItem.current = null;
    dragPastaOverItem.current = null;
    setPastas(_pastas);

    try {
      _pastas.forEach(async (pasta, index) => {
        await updateDoc(doc(db, "pastas", pasta.id), { ordem: index });
      });
    } catch (err) { console.error(err); }
  };

  const handleSortFerramenta = async (e, pastaId) => {
    e.stopPropagation();
    if (!dragToolItem.current || !dragToolOverItem.current) return;
    if (dragToolItem.current.pastaId !== pastaId || dragToolOverItem.current.pastaId !== pastaId) return;

    let toolsInFolder = ferramentas.filter(f => f.pastaId === pastaId).sort((a,b) => (a.ordem || 0) - (b.ordem || 0));
    const draggedIdx = toolsInFolder.findIndex(f => f.id === dragToolItem.current.id);
    const overIdx = toolsInFolder.findIndex(f => f.id === dragToolOverItem.current.id);

    const draggedObj = toolsInFolder.splice(draggedIdx, 1)[0];
    toolsInFolder.splice(overIdx, 0, draggedObj);

    const updatedTools = ferramentas.map(f => {
      if (f.pastaId === pastaId) {
        const newIndex = toolsInFolder.findIndex(tf => tf.id === f.id);
        return { ...f, ordem: newIndex };
      }
      return f;
    });
    setFerramentas(updatedTools);

    dragToolItem.current = null;
    dragToolOverItem.current = null;

    try {
      toolsInFolder.forEach(async (tool, index) => {
        await updateDoc(doc(db, "ferramentas", tool.id), { ordem: index });
      });
    } catch (err) { console.error(err); }
  };

  const handleSalvarPasta = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        nome: novaPasta.nome, 
        nomeIcone: novaPasta.nomeIcone,
        isLinkDireto: novaPasta.isLinkDireto || false,
        urlDestino: novaPasta.isLinkDireto ? novaPasta.urlDestino : '',
        abrirEmNovaAba: novaPasta.isLinkDireto ? novaPasta.abrirEmNovaAba : false
      };

      if (novaPasta.id) {
        await updateDoc(doc(db, "pastas", novaPasta.id), payload);
      } else {
        const docRef = await addDoc(collection(db, "pastas"), { ...payload, ordem: pastas.length });
        if (!novaPasta.isLinkDireto) {
          setFormData({ ...formData, pastaId: docRef.id }); 
        }
      }
      setIsPastaModalOpen(false);
      setNovaPasta({ id: null, nome: '', nomeIcone: 'LayoutDashboard', ordem: 999, isLinkDireto: false, urlDestino: '', abrirEmNovaAba: false });
      carregarDados();
    } catch (err) { console.error(err); }
  };

  const prepararEdicaoPasta = (pasta) => {
    setNovaPasta({
      ...pasta,
      isLinkDireto: pasta.isLinkDireto || false,
      urlDestino: pasta.urlDestino || '',
      abrirEmNovaAba: pasta.abrirEmNovaAba || false
    });
    setIsPastaModalOpen(true);
  };

  const excluirPasta = async (pastaId) => {
    if(window.confirm("Excluir este item do menu lateral?")) {
      await deleteDoc(doc(db, "pastas", pastaId));
      carregarDados();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pastaId) return alert("Selecione uma pasta para organizar a ferramenta!");
    try {
      if (editandoId) {
        await updateDoc(doc(db, "ferramentas", editandoId), formData);
      } else {
        const totalNaPasta = ferramentas.filter(f => f.pastaId === formData.pastaId).length;
        await addDoc(collection(db, "ferramentas"), { ...formData, ordem: totalNaPasta });
      }
      fecharEResetarForm();
      carregarDados();
    } catch (err) { console.error(err); }
  };

  const prepararNovoLinkNaPasta = (pastaId) => {
    setEditandoId(null);
    setFormData({ titulo: '', descricao: '', pastaId: pastaId, categoria: '', urlDestino: '', nomeIcone: '', ativo: true, ordem: 999, abrirEmNovaAba: false });
    setIsFormOpen(true);
  };

  const prepararNovoLinkGlobal = () => {
    setEditandoId(null);
    setFormData({ titulo: '', descricao: '', pastaId: '', categoria: '', urlDestino: '', nomeIcone: '', ativo: true, ordem: 999, abrirEmNovaAba: false });
    setIsFormOpen(true);
  };

  const fecharEResetarForm = () => {
    setIsFormOpen(false);
    setEditandoId(null);
    setFormData({ titulo: '', descricao: '', pastaId: '', categoria: '', urlDestino: '', nomeIcone: '', ativo: true, ordem: 999, abrirEmNovaAba: false });
  };

  const prepararEdicao = (item) => {
    setEditandoId(item.id);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const pastaSelecionadaNoForm = pastas.find(p => p.id === formData.pastaId);
  const IconeHerdado = pastaSelecionadaNoForm ? (LucideIcons[pastaSelecionadaNoForm.nomeIcone] || LucideIcons.LayoutDashboard) : null;

  return (
    <div className={`min-h-screen p-6 md:p-12 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-[#f8f7f4] text-[#1a1a18]'}`}>
      <div className="max-w-4xl mx-auto">
        
        <header className="flex justify-between items-start mb-12">
          <div>
            <Link to="/" className={`flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-[#52525b] hover:text-[#c9a84c]' : 'text-[#9a9788] hover:text-[#c9a84c]'}`}>
              <ArrowLeft size={14} /> Voltar ao HUB
            </Link>
            <h1 className={`text-4xl font-serif ${isDarkMode ? 'text-white' : 'text-[#004e4c]'}`}>
              Gestão do HUB<span className="text-[#c9a84c]">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className={`w-px h-6 ${isDarkMode ? 'bg-[#27272a]' : 'bg-[#ece9e3]'}`}></div>
            <button onClick={() => { auth.signOut(); navigate('/login'); }} className={`btn btn-sm font-bold border transition-all ${isDarkMode ? 'bg-[#1c1c20] border-[#27272a] text-[#ef4444] hover:bg-[#ef4444] hover:text-white' : 'border-[#fca5a5] text-[#dc2626] hover:bg-[#fee2e2]'}`}>
              Sair do Sistema
            </button>
          </div>
        </header>

        {/* LISTA UNIFICADA */}
        <div className={`rounded-[24px] shadow-card overflow-hidden mb-8 transition-colors duration-500 ${isDarkMode ? 'bg-[#1c1c20] border border-[#27272a]' : 'bg-white border border-[#ece9e3]'}`}>
          <div className={`p-8 border-b flex justify-between items-center ${isDarkMode ? 'border-[#27272a]' : 'border-[#f0eee9]'}`}>
            <div>
              <h2 className={`font-bold text-xs uppercase tracking-widest ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#1a1a18]'}`}>
                Estrutura de Menus e Acessos
              </h2>
              <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'}`}>Arraste itens para alterar a ordem da barra lateral.</p>
            </div>
            <button onClick={() => { setNovaPasta({id: null, nome: '', nomeIcone: 'LayoutDashboard', ordem: 999, isLinkDireto: false, urlDestino: '', abrirEmNovaAba: false}); setIsPastaModalOpen(true); }} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 border transition-all ${isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white hover:bg-[#00a8a3] hover:border-[#00a8a3]' : 'bg-white border-[#ece9e3] text-[#004e4c] hover:bg-[#e8f5f4]'}`}>
              <FolderPlus size={16} /> Nova pasta
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {pastas.map((pasta, indexPasta) => {
              const IconePasta = LucideIcons[pasta.nomeIcone] || LucideIcons.LayoutDashboard;
              const ferramentasDaPasta = ferramentas.filter(f => f.pastaId === pasta.id).sort((a,b) => (a.ordem||0) - (b.ordem||0));
              
              return (
                <div key={pasta.id} className="animate-fadeIn">
                  
                  <div 
                    draggable
                    onDragStart={(e) => { e.stopPropagation(); dragPastaItem.current = indexPasta; }}
                    onDragEnter={(e) => { e.stopPropagation(); dragPastaOverItem.current = indexPasta; }}
                    onDragEnd={handleSortPasta}
                    onDragOver={(e) => e.preventDefault()}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-colors ${isDarkMode ? 'bg-[#252529] hover:bg-[#2c2c30]' : 'bg-[#f4f2ed] hover:bg-[#ebe8e0]'}`}
                  >
                    <GripVertical size={18} className={isDarkMode ? 'text-[#71717a]' : 'text-[#d4d4d8]'} />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-[#1c1c20] border border-[#27272a] text-[#c9a84c]' : 'bg-white text-[#004e4c] shadow-sm'}`}>
                      <IconePasta size={16} />
                    </div>
                    
                    <span className={`font-serif text-[17px] font-bold flex-1 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-[#004e4c]'}`}>
                      {pasta.nome}
                      {pasta.isLinkDireto && (
                        <span className={`text-[9px] font-sans px-2 py-0.5 rounded uppercase tracking-widest font-black ${isDarkMode ? 'bg-[#00a8a3]/20 text-[#00a8a3]' : 'bg-[#e8f5f4] text-[#004e4c]'}`}>Link Direto</span>
                      )}
                    </span>
                    
                    <div className="flex gap-1">
                      {!pasta.isLinkDireto && (
                        <button onClick={() => prepararNovoLinkNaPasta(pasta.id)} title="Adicionar link nesta pasta" className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-[#c9a84c] hover:text-white hover:bg-[#3f3f46]' : 'text-[#c9a84c] hover:text-white hover:bg-[#004e4c] shadow-sm bg-white'}`}>
                          <Plus size={16} />
                        </button>
                      )}
                      {!pasta.isLinkDireto && <div className={`w-px h-5 mx-1 my-auto ${isDarkMode ? 'bg-[#3f3f46]' : 'bg-[#d4d4d8]'}`}></div>}
                      
                      <button onClick={() => prepararEdicaoPasta(pasta)} title="Editar Menu" className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46]' : 'text-[#5a5a52] hover:bg-white shadow-sm'}`}>
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => excluirPasta(pasta.id)} title="Excluir Menu" className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-[#a1a1aa] hover:text-red-400 hover:bg-[#3f3f46]' : 'text-[#5a5a52] hover:text-red-500 hover:bg-white shadow-sm'}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {!pasta.isLinkDireto && (
                    <div className={`ml-6 pl-4 py-2 border-l-2 space-y-1 ${isDarkMode ? 'border-[#27272a]' : 'border-[#ece9e3]'}`}>
                      {ferramentasDaPasta.map((item) => {
                        const IconeItem = LucideIcons[item.nomeIcone || pasta.nomeIcone || 'LayoutDashboard'] || LucideIcons.LayoutDashboard;
                        
                        return (
                          <div 
                            key={item.id} 
                            draggable
                            onDragStart={(e) => { e.stopPropagation(); dragToolItem.current = item; }}
                            onDragEnter={(e) => { e.stopPropagation(); dragToolOverItem.current = item; }}
                            onDragEnd={(e) => handleSortFerramenta(e, pasta.id)}
                            onDragOver={(e) => e.preventDefault()}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors ${isDarkMode ? 'hover:bg-[#252529]' : 'hover:bg-[#faf9f5]'}`}
                          >
                            <GripVertical size={14} className={isDarkMode ? 'text-[#71717a]' : 'text-[#d4d4d8]'} />
                            <IconeItem size={16} className={isDarkMode ? 'text-[#a1a1aa]' : 'text-[#9a9788]'} />
                            <div className="flex-1 flex flex-col justify-center">
                              <span className={`font-bold text-[13px] leading-tight ${isDarkMode ? 'text-white' : 'text-[#1a1a18]'}`}>{item.titulo}</span>
                              <span className={`text-[9px] uppercase tracking-widest font-bold mt-0.5 ${isDarkMode ? 'text-[#71717a]' : 'text-[#9a9788]'}`}>{item.categoria}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => prepararEdicao(item)} className={`p-1.5 rounded-md transition-all ${isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#5a5a52] hover:text-[#004e4c] hover:bg-[#ece9e3]'}`}><Edit3 size={14} /></button>
                              <button onClick={async () => { if(window.confirm("Excluir acesso?")) { await deleteDoc(doc(db, "ferramentas", item.id)); carregarDados(); } }} className={`p-1.5 rounded-md transition-all ${isDarkMode ? 'text-[#a1a1aa] hover:text-red-400 hover:bg-[#27272a]' : 'text-[#5a5a52] hover:text-red-500 hover:bg-[#fee2e2]'}`}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        );
                      })}
                      {ferramentasDaPasta.length === 0 && <p className={`text-xs ml-2 py-1 italic ${isDarkMode ? 'text-[#71717a]' : 'text-[#d4d4d8]'}`}>Nenhum link cadastrado nesta pasta.</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={prepararNovoLinkGlobal} className={`w-full p-6 font-bold flex items-center justify-center gap-2 transition-all uppercase text-[11px] tracking-widest border-t ${isDarkMode ? 'bg-[#1c1c20] text-[#00a8a3] hover:bg-[#00a8a3] hover:text-white border-[#27272a]' : 'bg-[#faf9f5] text-[#004e4c] hover:bg-[#004e4c] hover:text-white border-[#f0eee9]'}`}>
            <Plus size={18} /> Cadastrar Novo Link
          </button>
        </div>

        {/* MODAL SALVAR PASTA / LINK DIRETO (AGORA COM A CHECKBOX) */}
        {isPastaModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className={`w-full max-w-[380px] p-8 rounded-[24px] shadow-2xl flex flex-col items-center ${isDarkMode ? 'bg-[#1c1c20] border border-[#27272a]' : 'bg-white'}`}>
              <h3 className={`text-xl font-serif mb-6 w-full text-center ${isDarkMode ? 'text-white' : 'text-[#004e4c]'}`}>
                {novaPasta.id ? 'Editar Menu' : 'Criar Nova Pasta'}
              </h3>
              
              <form onSubmit={handleSalvarPasta} className="w-[304px]">
                
                {/* CHECKBOX DE LINK DIRETO */}
                <div className={`mb-5 flex justify-center border-b pb-5 border-dashed ${isDarkMode ? 'border-[#3f3f46]' : 'border-[#ece9e3]'}`}>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={novaPasta.isLinkDireto} 
                      onChange={(e) => setNovaPasta({...novaPasta, isLinkDireto: e.target.checked})} 
                      className={`w-4 h-4 cursor-pointer ${isDarkMode ? 'accent-[#00a8a3]' : 'accent-[#004e4c]'}`}
                    />
                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-[#a1a1aa] group-hover:text-white' : 'text-[#5a5a52] group-hover:text-[#004e4c]'}`}>
                      Quero criar uma página
                    </span>
                  </label>
                </div>

                <div className="mb-5">
                  <label className={`block mb-1.5 text-xs text-center font-semibold uppercase tracking-widest ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Nome</label>
                  <input maxLength={30} type="text" autoFocus className={`w-full p-3 rounded-xl border text-center font-medium outline-none transition-all ${isDarkMode ? 'bg-[#121212] border-[#27272a] text-white focus:!bg-[#121212] focus:!text-white focus:!border-[#004e4c]' : 'bg-white border-[#ece9e3] focus:border-[#004e4c]'}`} value={novaPasta.nome} onChange={e => setNovaPasta({...novaPasta, nome: e.target.value})} required placeholder="Máx 30 caracteres..." />
                </div>

                {/* SÓ APARECE SE FOR LINK DIRETO */}
                {novaPasta.isLinkDireto && (
                  <div className="mb-5 animate-fadeIn">
                    <label className={`block mb-1.5 text-xs text-center font-semibold uppercase tracking-widest ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>URL de Destino</label>
                    <input type="url" className={`w-full p-3 rounded-xl border text-center font-medium outline-none transition-all ${isDarkMode ? 'bg-[#121212] border-[#27272a] text-white focus:!bg-[#121212] focus:!text-white focus:!border-[#004e4c]' : 'bg-white border-[#ece9e3] focus:border-[#004e4c]'}`} value={novaPasta.urlDestino} onChange={e => setNovaPasta({...novaPasta, urlDestino: e.target.value})} required placeholder="https://..." />
                    
                    <div className="flex gap-2 mt-3">
                      <label className={`flex-1 p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${novaPasta.abrirEmNovaAba === false ? (isDarkMode ? 'bg-[#00a8a3]/10 border-[#00a8a3] text-white' : 'bg-[#e8f5f4] border-[#004e4c] text-[#004e4c]') : (isDarkMode ? 'bg-[#121212] border-[#27272a] text-[#71717a]' : 'bg-white border-[#ece9e3] text-[#5a5a52]')}`}>
                          <input type="radio" className="hidden" checked={novaPasta.abrirEmNovaAba === false} onChange={() => setNovaPasta({...novaPasta, abrirEmNovaAba: false})} />
                          <LucideIcons.LayoutTemplate size={14} /> <span className="font-bold text-[10px] uppercase">Iframe</span>
                      </label>
                      <label className={`flex-1 p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${novaPasta.abrirEmNovaAba === true ? (isDarkMode ? 'bg-[#00a8a3]/10 border-[#00a8a3] text-white' : 'bg-[#e8f5f4] border-[#004e4c] text-[#004e4c]') : (isDarkMode ? 'bg-[#121212] border-[#27272a] text-[#71717a]' : 'bg-white border-[#ece9e3] text-[#5a5a52]')}`}>
                          <input type="radio" className="hidden" checked={novaPasta.abrirEmNovaAba === true} onChange={() => setNovaPasta({...novaPasta, abrirEmNovaAba: true})} />
                          <LucideIcons.ExternalLink size={14} /> <span className="font-bold text-[10px] uppercase">Nova Guia</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <label className={`block mb-1.5 text-xs text-center font-semibold uppercase tracking-widest ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Ícone no Menu</label>
                  <div className={`grid grid-cols-6 gap-2 p-3 rounded-xl border mx-auto ${isDarkMode ? 'bg-[#121212] border-[#27272a]' : 'bg-[#fafafa] border-[#ece9e3]'}`}>
                    {ICONES_SISTEMA.map(nome => {
                      const IconeOpcao = LucideIcons[nome];
                      return (
                        <button key={nome} type="button" onClick={() => setNovaPasta({...novaPasta, nomeIcone: nome})} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${novaPasta.nomeIcone === nome ? (isDarkMode ? 'bg-[#00a8a3] text-white shadow-md scale-105' : 'bg-[#004e4c] text-white shadow-md scale-105') : (isDarkMode ? 'bg-[#1c1c20] text-[#71717a] hover:text-white border border-[#27272a]' : 'bg-white text-[#9a9788] hover:text-[#004e4c] border border-[#ece9e3]')}`}>
                          <IconeOpcao size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsPastaModalOpen(false)} className={`flex-1 p-3 rounded-xl border font-bold text-sm transition-colors ${isDarkMode ? 'border-[#3f3f46] text-[#a1a1aa] hover:bg-[#27272a]' : 'border-[#ece9e3] text-[#9a9788] hover:bg-[#faf9f5]'}`}>Cancelar</button>
                  <button type="submit" className={`flex-1 p-3 rounded-xl text-white font-bold text-sm transition-colors ${isDarkMode ? 'bg-[#00a8a3] hover:bg-[#008f8a]' : 'bg-[#004e4c] hover:bg-[#003d3c]'}`}>Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FORMULÁRIO DA FERRAMENTA */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className={`w-full max-w-xl max-h-[95vh] overflow-y-auto custom-scrollbar p-8 md:p-10 rounded-[24px] shadow-2xl ${isDarkMode ? 'bg-[#1c1c20] border border-[#27272a]' : 'bg-white'}`}>
              
              <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-[#27272a]' : 'border-[#f0eee9]'}`}>
                <h2 className={`text-2xl font-serif ${isDarkMode ? 'text-white' : 'text-[#004e4c]'}`}>
                  {editandoId ? 'Editar Acesso' : 'Novo Acesso'}
                </h2>
                <button type="button" onClick={fecharEResetarForm} className={`transition-colors ${isDarkMode ? 'text-[#71717a] hover:text-red-400' : 'text-[#9a9788] hover:text-red-500'}`}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="fg">
                  <label className={`block mb-2 text-sm font-semibold ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Pasta Vinculada</label>
                  <select 
                    className={`w-full p-3 rounded-xl border outline-none font-medium transition-all ${isDarkMode ? 'bg-[#121212] border-[#27272a] text-white focus:!border-[#004e4c]' : 'bg-white border-[#ece9e3] focus:border-[#004e4c]'}`}
                    value={formData.pastaId}
                    onChange={e => setFormData({...formData, pastaId: e.target.value})}
                    required
                  >
                    <option value="" disabled>Selecione uma pasta...</option>
                    {/* Filtra para não deixar colocar um link dentro de um Link Direto */}
                    {pastas.filter(p => !p.isLinkDireto).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="fg">
                    <label className={`block mb-2 text-sm font-semibold ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Título da Ferramenta</label>
                    <input maxLength={40} className={`w-full p-3 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-[#121212] border-[#27272a] text-white focus:!bg-[#121212] focus:!text-white focus:!border-[#004e4c]' : 'bg-white border-[#ece9e3] focus:border-[#004e4c]'}`} value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Máx 40 caracteres..." />
                  </div>
                  <div className="fg">
                    <label className={`block mb-2 text-sm font-semibold ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Categoria</label>
                    <input maxLength={25} className={`w-full p-3 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-[#121212] border-[#27272a] text-white focus:!bg-[#121212] focus:!text-white focus:!border-[#004e4c]' : 'bg-white border-[#ece9e3] focus:border-[#004e4c]'}`} value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} placeholder="Ex: Gestão (Máx 25 carac.)" required />
                  </div>
                </div>

                <div className="fg">
                  <label className={`block mb-2 text-sm font-semibold ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Descrição Curta (Aparece no Card)</label>
                  <textarea maxLength={120} rows="2" className={`w-full p-3 rounded-xl border resize-none outline-none transition-all ${isDarkMode ? 'bg-[#121212] border-[#27272a] text-white focus:!bg-[#121212] focus:!text-white focus:!border-[#004e4c]' : 'bg-white border-[#ece9e3] focus:border-[#004e4c]'}`} value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Para que serve este link? (Máx 120 caracteres)" />
                </div>

                <div className="fg">
                  <label className={`block mb-2 text-sm font-semibold ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>URL de Destino</label>
                  <input type="url" className={`w-full p-3 rounded-xl border outline-none transition-all ${isDarkMode ? 'bg-[#121212] border-[#27272a] text-white focus:!bg-[#121212] focus:!text-white focus:!border-[#004e4c]' : 'bg-white border-[#ece9e3] focus:border-[#004e4c]'}`} value={formData.urlDestino} onChange={e => setFormData({...formData, urlDestino: e.target.value})} required placeholder="https://..." />
                </div>

                <div className="fg">
                  <label className={`block mb-2 text-sm font-semibold ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Comportamento de Abertura</label>
                  <div className="flex gap-4">
                     <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${formData.abrirEmNovaAba === false ? (isDarkMode ? 'bg-[#00a8a3]/10 border-[#00a8a3] text-white' : 'bg-[#e8f5f4] border-[#004e4c] text-[#004e4c]') : (isDarkMode ? 'bg-[#121212] border-[#27272a] text-[#71717a]' : 'bg-white border-[#ece9e3] text-[#5a5a52]')}`}>
                        <input type="radio" name="abrirEm" className="hidden" checked={formData.abrirEmNovaAba === false} onChange={() => setFormData({...formData, abrirEmNovaAba: false})} />
                        <LucideIcons.LayoutTemplate size={20} />
                        <div>
                          <div className="font-bold text-sm leading-none mb-1">Interno</div>
                          <div className="text-[10px] opacity-70 leading-none">Abre dentro do painel</div>
                        </div>
                     </label>
                     <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${formData.abrirEmNovaAba === true ? (isDarkMode ? 'bg-[#00a8a3]/10 border-[#00a8a3] text-white' : 'bg-[#e8f5f4] border-[#004e4c] text-[#004e4c]') : (isDarkMode ? 'bg-[#121212] border-[#27272a] text-[#71717a]' : 'bg-white border-[#ece9e3] text-[#5a5a52]')}`}>
                        <input type="radio" name="abrirEm" className="hidden" checked={formData.abrirEmNovaAba === true} onChange={() => setFormData({...formData, abrirEmNovaAba: true})} />
                        <LucideIcons.ExternalLink size={20} />
                        <div>
                          <div className="font-bold text-sm leading-none mb-1">Nova Guia</div>
                          <div className="text-[10px] opacity-70 leading-none">Recomendado para BI</div>
                        </div>
                     </label>
                  </div>
                </div>
                
                <div className="fg flex flex-col items-center">
                  <label className={`block mb-2 text-sm font-semibold w-full ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#5a5a52]'}`}>Ícone da Ferramenta</label>
                  <div className={`p-4 rounded-xl border flex flex-col items-center ${isDarkMode ? 'bg-[#121212] border-[#27272a]' : 'bg-[#fafafa] border-[#ece9e3]'}`}>
                    
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, nomeIcone: ''})} 
                      className={`w-[304px] py-2 mb-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${formData.nomeIcone === '' ? (isDarkMode ? 'bg-[#00a8a3] text-white shadow-md' : 'bg-[#004e4c] text-white shadow-md') : (isDarkMode ? 'bg-[#1c1c20] text-[#71717a] hover:text-white border border-[#27272a]' : 'bg-white text-[#9a9788] hover:text-[#004e4c] border border-[#ece9e3]')}`}
                    >
                      {IconeHerdado ? <IconeHerdado size={18} /> : <LayoutDashboard size={18} />} Herdar da Pasta
                    </button>

                    <div className="grid grid-cols-6 gap-2 w-[304px]">
                      {ICONES_SISTEMA.map(nome => {
                        const IconeOpcao = LucideIcons[nome];
                        return (
                          <button 
                            key={nome} 
                            type="button" 
                            onClick={() => setFormData({...formData, nomeIcone: nome})} 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${formData.nomeIcone === nome ? (isDarkMode ? 'bg-[#00a8a3] text-white shadow-md scale-105' : 'bg-[#004e4c] text-white shadow-md scale-105') : (isDarkMode ? 'bg-[#1c1c20] text-[#71717a] hover:text-white border border-[#27272a]' : 'bg-white text-[#9a9788] hover:text-[#004e4c] border border-[#ece9e3]')}`}
                          >
                            <IconeOpcao size={20} />
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className={`w-full py-4 uppercase tracking-widest font-black text-[15px] rounded-xl text-white transition-all text-center flex justify-center items-center ${isDarkMode ? 'bg-[#00a8a3] hover:bg-[#008f8a]' : 'bg-[#004e4c] hover:bg-[#003d3c]'}`}>
                     {editandoId ? 'Salvar Alterações' : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}