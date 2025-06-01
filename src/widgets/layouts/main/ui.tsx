import React, {useState} from 'react';
import {ChevronDown, GraduationCap, Heart, Home, LogOut, Menu, Search, Ticket, X} from 'lucide-react';
import {usePageTitle} from '../../../shared/lib';
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../../../entities/user";
import {UserRole} from "../../../entities/user/types.ts";

export type MainLayoutProps = {
    header: string,
    children?: React.ReactNode;
};

export const MainLayout = ({header, children}: MainLayoutProps) => {
    const {session} = useUserStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const navigate = useNavigate()

    const isRouteActive = (route: string) => window.location.pathname === route
    const hasPermission = (role: UserRole) => session?.role === role || session?.role === UserRole.admin

    const menuItems = [
        {icon: Home, label: 'Dashboard', route: '/', active: isRouteActive('/'), hasPermission: true},
        {
            icon: GraduationCap,
            label: 'Masters',
            route: '/masters',
            active: isRouteActive('/masters'),
            hasPermission: hasPermission(UserRole.master)
        },
        {
            icon: Heart,
            label: 'Volunteers',
            route: '/volunteers',
            active: isRouteActive('/volunteers'),
            hasPermission: hasPermission(UserRole.volunteer)
        },
        {
            icon: Ticket,
            label: 'Tickets',
            route: '/tickets',
            active: isRouteActive('/tickets'),
            hasPermission: hasPermission(UserRole.tickets)
        },
    ];

    usePageTitle(header)

    return (
        <div className="min-h-screen bg-stone-100">
            {/* Header */}
            <header
                className="bg-stone-50 border-b border-stone-200 px-4 lg:px-6 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <img src="/images/logo.png" alt="Logo" className="h-12" />
                    </div>
                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-stone-200 transition-colors flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        Menu
                    </button>
                </div>

                {/* Desktop Navigation Menu */}
                <nav className="hidden lg:flex items-center space-x-8">
                    {menuItems.map((item, index) => (
                        item.hasPermission && <button
                            key={index}
                            onClick={() => navigate(item.route)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                                item.active
                                    ? 'bg-amber-100 text-amber-800 font-medium'
                                    : 'text-stone-600 hover:text-stone-800 hover:bg-stone-200'
                            }`}
                        >
                            <item.icon size={18}/>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Section */}
                <div className="flex items-center space-x-4">
                    <button className="hidden sm:flex p-2 rounded-md hover:bg-stone-200 transition-colors">
                        <Search size={20} className="text-stone-600"/>
                    </button>
                    <div className="relative">
                        <button
                            className="flex items-center space-x-2 cursor-pointer group p-2 rounded-md hover:bg-stone-200 transition-colors"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        >
                            <div className="w-8 h-8 bg-stone-300 rounded-full flex items-center justify-center">
                                <span className="text-stone-600 font-medium text-sm">{session?.username?.charAt(0)}</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm font-medium text-stone-800">{session?.username}</div>
                                <div className="text-xs text-stone-500">{session?.role}</div>
                            </div>
                            <ChevronDown size={16}
                                         className={`text-stone-500 transition-all duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        {/* User Dropdown Menu */}
                        {isUserMenuOpen && (
                            <div
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-stone-200 py-1 z-50">
                                {/*<button*/}
                                {/*    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors" onClick={() => navigate('/profile')}>*/}
                                {/*    <User size={16}/>*/}
                                {/*    <span>Profile</span>*/}
                                {/*</button>*/}
                                {/*<hr className="my-1 border-stone-200"/>*/}
                                <button
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={() => useUserStore.getState().logout(session)}>
                                    <LogOut size={16}/>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-opacity-50"
                     onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed left-0 top-0 h-full w-64 bg-stone-50 shadow-lg"
                         onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-stone-200">
                            <div className="flex items-center space-x-2">
                                <img src="/images/logo.png" alt="Logo" className="h-12" />
                            </div>
                        </div>
                        <nav className="p-4 space-y-2">
                            {menuItems.map((item, index) => (
                                item.hasPermission && <button
                                    key={index}
                                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-colors ${
                                        item.active
                                            ? 'bg-amber-100 text-amber-800 font-medium'
                                            : 'text-stone-600 hover:text-stone-800 hover:bg-stone-200'
                                    }`}
                                    onClick={() => navigate(item.route)}
                                >
                                    <item.icon size={20}/>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Click outside to close user menu */}
            {isUserMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
