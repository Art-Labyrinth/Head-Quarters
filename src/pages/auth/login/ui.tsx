import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VITE_API_URL_PREFIX } from '../../../shared/configs/config.ts';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = React.useCallback(async () => {
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

        try {
            const response = await fetch(`${VITE_API_URL_PREFIX}user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.access_token.token);
            toast.success('Login successful!');
            navigate('/dashboard');

        } catch (error) {
            console.error('Error during login:', error);
            toast.error('Login failed. Please try again.');
        }
    }, [navigate]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.id === 'username' || activeElement.id === 'password')) {
                    handleLogin();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleLogin]);

    return (
        <div className="flex flex-col items-center justify-center h-screen text-orange-100">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            <div className="flex flex-col w-sm shadow-md rounded text-black">
                <input id="username" type="text" placeholder="Username" required className="mb-3 p-2 border rounded bg-amber-50" />
                <input id="password" type="password" placeholder="Password" required className="mb-3 p-2 border rounded bg-amber-50" />
                <button type="button" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
};

export default Login;
