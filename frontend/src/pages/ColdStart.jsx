import { useState, useEffect, useMemo } from 'react';

const getStatusMessage = (progressValue) => {
  if (progressValue >= 95) return 'Finalizing connection...';
  if (progressValue >= 80) return 'Almost there...';
  if (progressValue >= 60) return 'Preparing fresh groceries...';
  if (progressValue >= 40) return 'Loading your preferences...';
  if (progressValue >= 20) return 'Connecting to database...';
  return 'Waking up our servers...';
};

// Internal component that handles auto-increment when no external progress is provided
const AutoProgressColdStart = () => {
  const [displayProgress, setDisplayProgress] = useState(0);

  const statusMessage = useMemo(() => getStatusMessage(displayProgress), [displayProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.5;
        return Math.min(prev + increment, 95);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return <ColdStartUI progress={displayProgress} statusMessage={statusMessage} />;
};

// External progress component
const ExternalProgressColdStart = ({ progress }) => {
  const statusMessage = useMemo(() => getStatusMessage(progress), [progress]);
  return <ColdStartUI progress={progress} statusMessage={statusMessage} />;
};

// Presentational component
const ColdStartUI = ({ progress, statusMessage }) => (
  <div className="cold-start-page">
    <div className="cold-start-content">
      <div className="cold-start-logo">
        <span className="logo-emoji">🛒</span>
        <h1>Happy Groceries</h1>
      </div>

      <div className="cold-start-message">
        <h2>We are connecting you to Happy Groceries!</h2>
        <p>Our servers are waking up from a cold start. This may take a moment...</p>
      </div>

      <div className="progress-container">
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
          <div
            className="progress-bar-glow"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-status">{statusMessage}</span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="cold-start-animation">
        <div className="floating-grocery" style={{ animationDelay: '0s' }}>🍎</div>
        <div className="floating-grocery" style={{ animationDelay: '0.5s' }}>🥕</div>
        <div className="floating-grocery" style={{ animationDelay: '1s' }}>🥛</div>
        <div className="floating-grocery" style={{ animationDelay: '1.5s' }}>🍞</div>
        <div className="floating-grocery" style={{ animationDelay: '2s' }}>🥚</div>
      </div>

      <div className="cold-start-tips">
        <p>💡 Did you know? We source our products from local farmers!</p>
      </div>
    </div>

    <style>{`
      .cold-start-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-blue) 100%);
        padding: 2rem;
      }

      .cold-start-content {
        background: var(--bg-white);
        border-radius: var(--border-radius);
        padding: 3rem 2.5rem;
        max-width: 500px;
        width: 100%;
        text-align: center;
        box-shadow: var(--shadow-hover);
        animation: slideUp 0.5s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .cold-start-logo {
        margin-bottom: 2rem;
      }

      .logo-emoji {
        font-size: 4rem;
        display: block;
        margin-bottom: 0.5rem;
        animation: bounce 2s ease infinite;
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .cold-start-logo h1 {
        color: var(--primary-pink);
        font-family: 'Comic Neue', cursive;
        font-size: 2rem;
        margin: 0;
      }

      .cold-start-message h2 {
        color: var(--text-dark);
        font-size: 1.3rem;
        margin-bottom: 0.5rem;
      }

      .cold-start-message p {
        color: var(--text-dark);
        opacity: 0.7;
        margin-bottom: 2rem;
      }

      .progress-container {
        margin: 2rem 0;
      }

      .progress-bar-wrapper {
        position: relative;
        height: 12px;
        background: var(--bg-light);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-pink) 0%, var(--primary-blue) 100%);
        border-radius: 20px;
        transition: width 0.3s ease;
        position: relative;
      }

      .progress-bar-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.3) 50%,
          transparent 100%
        );
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }

      .progress-bar-glow {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background: var(--primary-pink);
        border-radius: 50%;
        box-shadow: 0 0 20px var(--primary-pink), 0 0 40px var(--primary-pink);
        transition: left 0.3s ease;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.75rem;
        font-size: 0.9rem;
      }

      .progress-status {
        color: var(--text-dark);
        font-weight: 600;
      }

      .progress-percentage {
        color: var(--primary-pink);
        font-weight: 700;
      }

      .cold-start-animation {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin: 2rem 0;
        height: 40px;
      }

      .floating-grocery {
        font-size: 1.5rem;
        animation: floatGrocery 2s ease-in-out infinite;
        opacity: 0.6;
      }

      @keyframes floatGrocery {
        0%, 100% { 
          transform: translateY(0) rotate(0deg);
          opacity: 0.6;
        }
        50% { 
          transform: translateY(-15px) rotate(10deg);
          opacity: 1;
        }
      }

      .cold-start-tips {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }

      .cold-start-tips p {
        color: var(--text-dark);
        opacity: 0.8;
        font-size: 0.85rem;
        margin: 0;
      }

      body.dark-mode .cold-start-content {
        background: var(--bg-white);
      }

      body.dark-mode .progress-bar-wrapper {
        background: rgba(255, 255, 255, 0.1);
      }

      body.dark-mode .cold-start-tips {
        border-top-color: rgba(255, 255, 255, 0.1);
      }
    `}</style>
  </div>
);

// Main component that decides which version to render
const ColdStart = ({ progress = 0 }) => {
  if (progress > 0) {
    return <ExternalProgressColdStart progress={progress} />;
  }
  return <AutoProgressColdStart />;
};

export default ColdStart;
