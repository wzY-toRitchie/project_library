import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <main className="flex-1 flex flex-col w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout;
