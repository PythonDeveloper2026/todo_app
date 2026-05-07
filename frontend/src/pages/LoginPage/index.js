import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/app/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 15 }}>
        <h2>Login</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <input 
          className="input-field"
          type="text" 
          placeholder="Username or Email" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
        />
        <input 
          className="input-field"
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button className="btn btn-primary" type="submit">Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
};

export default LoginPage;
