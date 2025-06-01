import React  from 'react';
import {usePageTitle} from '../../../shared/lib';

export type LoginLayoutProps = {
    header: string,
    children?: React.ReactNode;
};

export const LoginLayout = ({header, children}: LoginLayoutProps) => {
    usePageTitle(header)

    return (
        <div className="min-h-screen bg-stone-100">
            {/* Main Content */}
            <main className="p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
