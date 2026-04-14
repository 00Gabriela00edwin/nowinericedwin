import React, { useState, useEffect } from 'react';
import './MundialCountdown.css';

const MundialCountdown = () => {
  // Fecha estimada del inicio del Mundial: 11 de Junio de 2026
  const targetDate = new Date('2026-06-11T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    let time = {};
    if (difference > 0) {
      time = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        min: Math.floor((difference / 1000 / 60) % 60),
        seg: Math.floor((difference / 1000) % 60),
      };
    } else {
      time = { días: 0, horas: 0, min: 0, seg: 0 };
    }
    return time;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mundial-banner">
      <div className="mundial-content">
        
        {/* BLOQUE 1: TEXTO + ESCUDO */}
        <div className="mundial-text">
          <div className="titulo-con-escudo">
            <img src="/img/futbol.png" alt="Escudo Nowin" className="escudo-mini" />
            <h4 className="edicion-title">EDICIÓN MUNDIAL</h4>
          </div>
          <h2 className="producto-title">SAL FUTBOLERA</h2>
          <p className="slogan">Ponelé sabor a cada jugada</p>
        </div>
        
        {/* BLOQUE 2: IMAGEN DEL PRODUCTO (LA BOLSA) */}
        <div className="mundial-product-image">
          <img src="/img/salmundial.png" alt="Bolsa Nowin Sal Futbolera" className="bolsa-sal" />
        </div>

        {/* BLOQUE 3: CONTADOR */}
        <div className="countdown-container">
          {Object.keys(timeLeft).map((interval, index) => (
            <div className="time-box" key={index}>
              <span className="time-number">
                {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
              </span>
              <span className="time-label">{interval}</span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default MundialCountdown;