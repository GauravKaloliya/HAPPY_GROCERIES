const ConnectivityError = ({ onRetry }) => {
  return (
    <div className="connectivity-error-page">
      <div className="connectivity-error-content">
        <div className="connectivity-error-icon">🔌</div>
        <h1>Connection Error</h1>
        <h2>Something went wrong</h2>
        <p className="connectivity-error-message">
          We're having trouble connecting to our servers. Please check your internet connection and try again.
        </p>
        <div className="connectivity-error-actions">
          <button onClick={onRetry} className="btn-md btn-primary">
            🔄 Try Again
          </button>
        </div>
        <div className="connectivity-error-details">
          <h3>What might be happening:</h3>
          <ul>
            <li>📶 Your internet connection might be unstable</li>
            <li>🔧 Our servers might be temporarily unavailable</li>
            <li>⚡ There might be a network configuration issue</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectivityError;
