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

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            <aside className="w-60 shrink-0 bg-gray-900 text-gray-100 flex flex-col">
                <div className="px-5 py-6 border-b border-gray-700">
                    <p className="text-lg font-semibold">Lend-Ring</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{user.role} account</p>
                </div>

                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm ${isActive
                                    ? 'bg-gray-700 text-white font-medium'
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

            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;