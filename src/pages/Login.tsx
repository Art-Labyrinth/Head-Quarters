import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL_PREFIX } from '../config';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const navigate = useNavigate();

    console.log('API URL Prefix:', API_URL_PREFIX);

    const handleLogin = () => {
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const username = usernameInput ? usernameInput.value : '';
        if (!username || username.length < 3) {
            toast.error('Username must be at least 3 characters long');
            return;
        }

        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const password = passwordInput ? passwordInput.value : '';
        if (!password || password.length < 3) {
            toast.error('Password must be at least 3 characters long');
            return;
        }

        if ("admin" === username && "admin" === password) {
            toast.success('Login successful!');
            navigate('/dashboard');
        } else {
            toast.error('Invalid username or password');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            <div className="flex flex-col w-sm shadow-md rounded">
                <input id="username" type="text" placeholder="Username" required className="mb-3 p-2 border rounded bg-amber-50" />
                <input id="password" type="password" placeholder="Password" required className="mb-3 p-2 border rounded bg-amber-50" />
                <button type="button" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
};

export default Login;