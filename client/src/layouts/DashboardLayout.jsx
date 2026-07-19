import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const NAV_BY_ROLE = {
    renter: [
        { to: '/dashboard/browse', label: 'Browse items' },
        { to: '/dashboard/orders', label: 'My orders' },
        { to: '/dashboard/settings', label: 'Settings' },
    ],
    lender: [
        { to: '/dashboard/listings', label: 'My listings' },
        { to: '/dashboard/add-item', label: 'Add item' },
        { to: '/dashboard/orders-received', label: 'Orders received' },
        { to: '/dashboard/earnings', label: 'Earnings' },
        { to: '/dashboard/settings', label: 'Settings' },
    ],
    admin: [
        { to: '/dashboard/users', label: 'Users' },
        { to: '/dashboard/moderate-listings', label: 'Listings' },
        { to: '/dashboard/disputes', label: 'Disputes' },
        { to: '/dashboard/transactions', label: 'Transactions' },
        { to: '/dashboard/settings', label: 'Settings' },
    ],
};

function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const navItems = NAV_BY_ROLE[user.role] || [];
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const sidebar = (
        <aside className="w-60 shrink-0 bg-gray-900 text-gray-100 flex flex-col h-full">
            <div className="px-5 py-6 border-b border-gray-700">
                <p className="text-lg font-semibold">Lend-Ring</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">{user.role} account</p>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                            `rounded-md px-3 py-2 text-sm ${isActive
                                ? 'bg-brand-600 text-white font-medium'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-5 py-4 border-t border-gray-700">
                <p className="text-sm truncate">{user.name}</p>
                <button
                    onClick={handleLogout}
                    className="mt-2 text-xs text-gray-400 hover:text-white underline"
                >
                    Log out
                </button>
            </div>
        </aside>
    );

    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden">
            <div className="hidden md:flex">{sidebar}</div>

            {/* mobile drawer + backdrop */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0">{sidebar}</div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 min-h-0">
                <header className="md:hidden shrink-0 flex items-center gap-3 bg-gray-900 text-white px-4 py-3">
                    <button
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                        className="text-2xl leading-none"
                    >
                        ☰
                    </button>
                    <span className="font-semibold">Lend-Ring</span>
                </header>

                <main className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;