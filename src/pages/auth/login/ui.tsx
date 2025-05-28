import React from 'react';
import {LoginForm} from "../../../widgets/auth/login";

export const Login: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-orange-100">
            <h1 className="text-3xl font-bold mb-6">Authorization</h1>
            <div className="flex flex-col w-sm shadow-md rounded text-black">
                <LoginForm/>
            </div>
        </div>
    );
};
