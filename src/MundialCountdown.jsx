
import React, { useState, useEffect } from 'react';
import './MundialCountdown.css';

const TARGET_DATE = new Date('2026-06-11T00:00:00').getTime();

const calculateTimeLeft = () => {
  const now = new Date().getTime();
  const difference = TARGET_DATE - now;

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
};

const MundialCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mundial-banner">
      <div className="mundial-content-simple">
        
        {/* BLOQUE 1: LA BOLSA DE SAL */}
        <div className="mundial-product">
          <img src="/img/salmundial.png" alt="Bolsa Nowin Sal Futbolera" className="bolsa-sal-simple" />
        </div>

        {/* BLOQUE 2: EL AVISO Y EL RELOJ */}
        <div className="mundial-timer-section">
          <h3 className="cta-mundial">¡No te quedes sin la tuya! ⚽</h3>
          
          <div className="countdown-container">
            {Object.keys(timeLeft).map((interval) => (
              <div className="time-box" key={interval}>
                <span className="time-number">
                  {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
                </span>
                <span className="time-label">{interval}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MundialCountdown;