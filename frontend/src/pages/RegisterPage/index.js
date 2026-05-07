import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      return setError("Passwords don't match");
    }
    try {
      await register(formData);
      navigate('/app/');
    } catch (err) {
      setError('Registration failed. Check your data.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 15 }}>
        <h2>Register</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <input className="input-field" type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input className="input-field" type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="input-field" type="text" name="first_name" placeholder="First Name" onChange={handleChange} />
        <input className="input-field" type="text" name="last_name" placeholder="Last Name" onChange={handleChange} />
        <input className="input-field" type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input className="input-field" type="password" name="password2" placeholder="Confirm Password" onChange={handleChange} required />
        <button className="btn btn-primary" type="submit">Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default RegisterPage;
