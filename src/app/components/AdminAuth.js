"use client";
import { useState } from 'react';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const AdminAuth = ({ onAuthSuccess, isAdmin }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      // Buscar documento de configuração do admin
      const adminRef = doc(db, 'admin', 'config');
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists() && adminDoc.data().email === email) {
        onAuthSuccess(true);
        setShowAuth(false);
        setError('');
      } else {
        setError('Acesso não autorizado');
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
    setError('');
  };

  return (
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
            <button type="submit" className="validate-button">
              <span>Validar</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAuth;
