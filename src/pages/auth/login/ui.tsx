import React from 'react';
import {LoginForm} from "../../../widgets/auth/login";
import {LoginLayout} from "../../../widgets/layouts/login";

export const Login: React.FC = () => {
    return (
        <LoginLayout header={"Login"}>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                    <LoginForm />
                </div>
            </div>
        </LoginLayout>
    );
};
