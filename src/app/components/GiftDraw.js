"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import AdminAuth from './AdminAuth';

const GiftDraw = () => {
  const [selectedGift, setSelectedGift] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [drawnGifts, setDrawnGifts] = useState([]);
  const [availableGifts, setAvailableGifts] = useState([]);
  const [allGifts, setAllGifts] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tempGift, setTempGift] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newGift, setNewGift] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedGift, setConfirmedGift] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const initializeFirestore = async () => {
      try {
        const giftRef = doc(db, 'gifts', 'status');
        const giftDoc = await getDoc(giftRef);
        
        if (!giftDoc.exists()) {
          // Criar documento inicial se não existir
          const initialGifts = [];
          
          await setDoc(giftRef, {
            drawn: [],
            gifts: initialGifts
          });
          
          setAllGifts(initialGifts);
          setAvailableGifts(initialGifts);
        } else {
          const data = giftDoc.data();
          setAllGifts(data.gifts || []);
          setDrawnGifts(data.drawn || []);
          setAvailableGifts(data.gifts.filter(gift => !data.drawn.includes(gift)));
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao inicializar Firestore:", error);
        alert("Erro ao carregar presentes. Tente recarregar a página.");
      }
    };

    initializeFirestore();

    const unsubscribe = onSnapshot(doc(db, 'gifts', 'status'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setAllGifts(data.gifts || []);
        setDrawnGifts(data.drawn || []);
        setAvailableGifts(data.gifts.filter(gift => !data.drawn.includes(gift)));
      }
    });

    return () => unsubscribe();
  }, []);

  const drawGift = () => {
    if (availableGifts.length === 0) {
      alert('Todos os presentes já foram sorteados!');
      return;
    }

    setIsDrawing(true);
    setIsAnimating(true);
    let currentGift = '';
    let count = 0;
    
    const interval = setInterval(() => {
      currentGift = availableGifts[Math.floor(Math.random() * availableGifts.length)];
      setSelectedGift(currentGift);
      count++;

      // Diminui a velocidade gradualmente
      if (count > 20) {
        clearInterval(interval);
        const slowInterval = setInterval(() => {
          currentGift = availableGifts[Math.floor(Math.random() * availableGifts.length)];
          setSelectedGift(currentGift);
        }, 200); // Mais lento

        setTimeout(() => {
          clearInterval(slowInterval);
          setIsAnimating(false);
          setIsDrawing(false);
          setTempGift(currentGift);
          setShowConfirmation(true);
        }, 1000);
      }
    }, 100);
  };

  const confirmGift = async () => {
    try {
      const giftRef = doc(db, 'gifts', 'status');
      const giftDoc = await getDoc(giftRef);

      if (!giftDoc.exists()) {
        // Criar documento se não existir
        await setDoc(giftRef, {
          drawn: [tempGift],
          gifts: allGifts,
        });
      } else {
        // Atualizar documento existente
        await updateDoc(giftRef, {
          drawn: [...drawnGifts, tempGift]
        });
      }
      
      setConfirmedGift(tempGift);
      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao confirmar presente:", error);
      alert("Erro ao confirmar presente. Tente novamente.");
    }
  };

  const rejectGift = () => {
    setShowConfirmation(false);
    setTempGift('');
  };

  const resetGifts = async () => {
    if (!isAdmin) return;
    
    try {
      const giftRef = doc(db, 'gifts', 'status');
      await setDoc(giftRef, {
        drawn: [],
        gifts: allGifts
      });
    } catch (error) {
      console.error('Erro ao resetar presentes:', error);
      alert('Erro ao resetar presentes. Tente novamente.');
    }
  };

  const addNewGift = async () => {
    if (!isAdmin || !newGift.trim()) return;
    
    try {
      const giftRef = doc(db, 'gifts', 'status');
      const giftDoc = await getDoc(giftRef);
      
      if (!giftDoc.exists()) {
        await setDoc(giftRef, {
          drawn: [],
          gifts: [newGift.trim()]
        });
      } else {
        await updateDoc(giftRef, {
          gifts: [...allGifts, newGift.trim()]
        });
      }
      
      setNewGift('');
    } catch (error) {
      console.error('Erro ao adicionar presente:', error);
      alert('Erro ao adicionar presente. Tente novamente.');
    }
  };

  const deleteGift = async (giftToDelete) => {
    if (!isAdmin) return;
    
    try {
      const giftRef = doc(db, 'gifts', 'status');
      const giftDoc = await getDoc(giftRef);
      
      if (giftDoc.exists()) {
        const updatedGifts = allGifts.filter(gift => gift !== giftToDelete);
        const updatedDrawnGifts = drawnGifts.filter(gift => gift !== giftToDelete);
        
        await updateDoc(giftRef, {
          gifts: updatedGifts,
          drawn: updatedDrawnGifts
        });
      }
    } catch (error) {
      console.error('Erro ao excluir presente:', error);
      alert('Erro ao excluir presente. Tente novamente.');
    }
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    setConfirmedGift('');
  };

  if (isLoading) {
    return <div className="container">Carregando presentes...</div>;
  }

  return (
    <div className="container">
      <AdminAuth onAuthSuccess={setIsAdmin} isAdmin={isAdmin} />
      
      <h1>Lista de Presentes</h1>
      <p className="subtitle">
        Presentes disponíveis: {availableGifts.length} de {allGifts.length}
      </p>
      
      <button 
        onClick={drawGift} 
        disabled={isAnimating || availableGifts.length === 0 || showConfirmation}
        className="drawButton"
      >
        {availableGifts.length === 0 ? 'Todos os presentes foram sorteados' : 'Sortear Presente'}
      </button>

      {isDrawing && (
        <div className="drawing-animation">
          <div className="gift-box">
            <div className="gift-lid"></div>
            <div className="gift-container"></div>
            <div className="gift-bow"></div>
          </div>
          <p className="drawing-text">{selectedGift}</p>
        </div>
      )}

      {showConfirmation && (
        <div className="confirmation-modal">
          <h2>Você foi sorteado para presentear o item:</h2>
          <p className="gift">{tempGift}</p>
          <div className="confirmation-question">
            <p>Você gostaria de presentear este item?</p>
            <div className="button-group">
              <button onClick={confirmGift} className="confirm-button">Sim</button>
              <button onClick={rejectGift} className="reject-button">Não, sortear novamente</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <h2>Parabéns!</h2>
            <p className="gift-confirmation">Seu presente é:</p>
            <p className="confirmed-gift">{confirmedGift}</p>
            <div className="print-instruction">
              <span className="icon">📸</span>
              <p>Tire um print desta tela para não esquecer seu presente!</p>
            </div>
            <button onClick={closeSuccessModal} className="close-button">
              Entendi
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="admin-panel">
          <button onClick={resetGifts} className="admin-button">
            Resetar Sorteio
          </button>
          
          <div className="add-gift-form">
            <input
              type="text"
              value={newGift}
              onChange={(e) => setNewGift(e.target.value)}
              placeholder="Novo presente para sorteio"
            />
            <button onClick={addNewGift} className="admin-button">
              Adicionar Presente
            </button>
          </div>

          <div className="gift-list-admin">
            <h3>Gerenciar Presentes:</h3>
            <ul>
              {allGifts.map((gift, index) => (
                <li key={index} className="gift-item">
                  <span>{gift}</span>
                  <button 
                    onClick={() => deleteGift(gift)}
                    className="delete-button"
                    title="Excluir presente"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {drawnGifts.length > 0 && (
        <div className="drawn-gifts">
          <h3>Presentes já sorteados:</h3>
          <ul>
            {drawnGifts.map((gift, index) => (
              <li key={index}>{gift}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GiftDraw;
