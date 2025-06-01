import { useEffect } from 'react';
import {LoginLayout} from "../../widgets/layouts/login";
import {useNavigate} from "react-router-dom";

export function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/')
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <LoginLayout header="Page not found">
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                    <p className="text-lg text-gray-600">Redirecting to the homepage...</p>
                </div>
            </div>
        </LoginLayout>
    );
}
