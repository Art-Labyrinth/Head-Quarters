import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL_PREFIX } from '../config';

const Login: React.FC = () => {
    const navigate = useNavigate();

    console.log('API URL Prefix:', API_URL_PREFIX);

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Login</h1>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
                <input type="text" placeholder="Username" required style={{ marginBottom: '10px', padding: '8px' }} />
                <input type="password" placeholder="Password" required style={{ marginBottom: '10px', padding: '8px' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}>Login</button>
            </form>
        </div>
    );
};

export default Login;