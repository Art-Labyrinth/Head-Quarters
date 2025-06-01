import React from 'react';
import {MainLayout} from "../../widgets/layouts/main";
import {useUserStore} from "../../entities/user";

export const Dashboard: React.FC = () => {
    const {session} = useUserStore()

    return (
        <MainLayout header={'Dashboard'}>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Welcome Back, {session?.username}!</h1>
                <p className="text-stone-600">Here's what's happening with your dashboard today.</p>
            </div>
        </MainLayout>
    )
};
