"use client";
import { useState } from 'react';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const AdminAuth = ({ onAuthSuccess, isAdmin }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const validateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const adminRef = doc(db, 'admin', 'config');
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        if (adminData.email === email && adminData.password === password) {
          onAuthSuccess(true);
          setShowAuth(false);
          setError('');
          setPassword(''); // Limpa a senha após login
          setMenuOpen(false); // Fecha o menu após login bem-sucedido
        } else {
          setError('Email ou senha incorretos');
        }
      } else {
        setError('Configuração de admin não encontrada');
      }
    } catch (error) {
      console.error('Erro ao validar admin:', error);
      setError('Erro ao validar acesso');
    }
  };

  const handleLogout = () => {
    onAuthSuccess(false);
    setShowAuth(false);
    setEmail('');
    setPassword('');
    setError('');
    setMenuOpen(false); // Fecha o menu após logout
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (showAuth) setShowAuth(false);
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <button 
        onClick={toggleMenu}
        className="menu-toggle"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <div className={`hamburger ${menuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Unified Sidebar */}
      <div className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button onClick={toggleMenu} className="close-sidebar">×</button>
        </div>
        
        <div className="sidebar-content">
          <div className="admin-auth">
            {!isAdmin ? (
              <button 
                onClick={() => setShowAuth(!showAuth)}
                className="admin-toggle"
              >
                Administrador
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="admin-toggle logout"
              >
                Sair
              </button>
            )}

            {showAuth && !isAdmin && (
              <div className="admin-modal">
                <h3>Acesso Administrativo</h3>
                <form onSubmit={validateAdmin} className="admin-form">
                  <div className="input-group">
                    <label htmlFor="adminEmail">Email</label>
                    <input
                      id="adminEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu email"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="adminPassword">Senha</label>
                    <input
                      id="adminPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                    />
                  </div>
                  <button type="submit" className="validate-button">
                    <span>Entrar</span>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {error && <p className="error">{error}</p>}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
};

export default AdminAuth;
