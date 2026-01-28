import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await AuthService.login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Введите email для восстановления пароля');
      return;
    }

    const result = await AuthService.resetPassword(email);
    if (result.success) {
      setError('Инструкции по восстановлению отправлены на ваш email');
    } else {
      setError('Ошибка при восстановлении пароля');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Вход в Qucord</h2>
          <p>Безопасный и приватный мессенджер</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <div className="auth-links">
            <button 
              type="button" 
              className="link-button"
              onClick={handleResetPassword}
            >
              Забыли пароль?
            </button>
            <span>•</span>
            <Link to="/register" className="link-button">
              Создать аккаунт
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
