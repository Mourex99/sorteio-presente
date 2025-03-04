"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { doc, updateDoc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
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
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

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
          // Atualizar verificando os itens já sorteados
          const drawnItems = (data.drawn || []).map(d => d.item);
          setAvailableGifts(data.gifts.filter(gift => !drawnItems.includes(gift)));
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
        const gifts = data.gifts || [];
        const drawn = data.drawn || [];
        
        setAllGifts(gifts);
        setDrawnGifts(drawn);
        // Calcular presentes disponíveis comparando os itens
        const drawnItems = drawn.map(d => d.item);
        const available = gifts.filter(gift => !drawnItems.includes(gift));
        setAvailableGifts(available);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsFormValid(userName.trim() !== '' && userSurname.trim() !== '');
  }, [userName, userSurname]);

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

      const drawnItem = {
        item: tempGift,
        name: userName,
        surname: userSurname
      };

      if (!giftDoc.exists()) {
        await setDoc(giftRef, {
          drawn: [drawnItem],
          gifts: allGifts,
        });
      } else {
        const updatedDrawn = [...drawnGifts, drawnItem];
        // Atualizar o documento com o novo item sorteado
        await updateDoc(giftRef, {
          drawn: updatedDrawn
        });
        
        // Atualizar estados locais
        setDrawnGifts(updatedDrawn);
        setAvailableGifts(allGifts.filter(gift => 
          !updatedDrawn.map(d => d.item).includes(gift)
        ));
      }
      
      setConfirmedGift(tempGift);
      setShowConfirmation(false);
      setShowSuccess(true);
      setUserName('');
      setUserSurname('');
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
      
      {/* Mostrar contagem apenas para admin */}
      {isAdmin && (
        <p className="subtitle">
          Presentes disponíveis: {availableGifts.length} de {allGifts.length}
        </p>
      )}
      
      <div className="user-form">
        <div className="input-group">
          <label htmlFor="userName">Nome:</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu nome"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="userSurname">Sobrenome:</label>
          <input
            id="userSurname"
            type="text"
            value={userSurname}
            onChange={(e) => setUserSurname(e.target.value)}
            placeholder="Digite seu sobrenome"
            required
          />
        </div>
      </div>

      <button 
        onClick={drawGift} 
        disabled={!isFormValid || isAnimating || availableGifts.length === 0 || showConfirmation}
        className="drawButton"
      >
        {!isFormValid ? 'Preencha seu nome completo' : 
         availableGifts.length === 0 ? 'Todos os presentes foram sorteados' : 
         'Sortear Presente'}
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

      {/* Lista de presentes sorteados para usuários normais */}
      {!isAdmin && drawnGifts.length > 0 && (
        <div className="drawn-gifts">
          <h3>Presentes já sorteados:</h3>
          <ul>
            {drawnGifts.map((drawn, index) => (
              <li key={index}>{drawn.item}</li>
            ))}
          </ul>
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

          <div className="drawn-gifts-admin">
            <h3>Presentes Sorteados ({drawnGifts.length}):</h3>
            <ul>
              {drawnGifts.map((drawn, index) => (
                <li key={index} className="drawn-item">
                  <span>{drawn.name} {drawn.surname}: {drawn.item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Remover a lista de presentes sorteados para usuários normais */}
    </div>
  );
};

export default GiftDraw;
