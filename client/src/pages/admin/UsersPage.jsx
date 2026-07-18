import { useEffect, useState } from 'react';
import { fetchUsers, updateUserFlags } from '../../api/admin';
import { card, input, btnPrimary, btnSecondary, btnDanger } from '../../utils/ui';

function UsersPage() {
    const [data, setData] = useState(null);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');

    async function load(page = 1) {
        try {
            setData(await fetchUsers({ search: search || undefined, role: role || undefined, page }));
        } catch {
            setError('Could not load users');
        }
    }

    useEffect(() => {
        load(1);
    }, []);

    async function toggle(user, field) {
        const updated = await updateUserFlags(user._id, { [field]: !user[field] });
        setData({ ...data, users: data.users.map((u) => (u._id === user._id ? updated : u)) });
    }

    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-500">Verify identities and suspend problem accounts.</p>

            <form
                onSubmit={(e) => { e.preventDefault(); load(1); }}
                className="mt-4 flex gap-3"
            >
                <input
                    placeholder="Search name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${input} flex-1 max-w-xs`}
                />
                <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
                    <option value="">All roles</option>
                    <option value="renter">Renters</option>
                    <option value="lender">Lenders</option>
                </select>
                <button className={btnPrimary}>Search</button>
            </form>

            {!data ? (
                <p className="mt-6 text-gray-500">Loading...</p>
            ) : (
                <>
                    <div className={`${card} mt-4 overflow-x-auto`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium text-center">Trust</th>
                                    <th className="px-4 py-3 font-medium">Flags</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.users.map((u) => (
                                    <tr key={u._id} className="border-b border-gray-50 last:border-0">
                                        <td className="px-4 py-3 text-gray-900">{u.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                        <td className="px-4 py-3 text-gray-700 capitalize">{u.role}</td>
                                        <td className="px-4 py-3 text-center text-gray-900">{u.trustScore}</td>
                                        <td className="px-4 py-3">
                                            <span className="flex gap-1">
                                                {u.isVerified && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">verified</span>
                                                )}
                                                {u.isSuspended && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">suspended</span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {u.role !== 'admin' && (
                                                <span className="flex gap-2 justify-end">
                                                    <button onClick={() => toggle(u, 'isVerified')} className={`${btnSecondary} text-xs`}>
                                                        {u.isVerified ? 'Unverify' : 'Verify'}
                                                    </button>
                                                    <button onClick={() => toggle(u, 'isSuspended')} className={`${btnDanger} text-xs`}>
                                                        {u.isSuspended ? 'Restore' : 'Suspend'}
                                                    </button>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {data.pages > 1 && (
                        <div className="mt-4 flex items-center gap-3 text-sm">
                            <button disabled={data.page <= 1} onClick={() => load(data.page - 1)} className={`${btnSecondary} disabled:opacity-40`}>←</button>
                            <span className="text-gray-600">Page {data.page} of {data.pages}</span>
                            <button disabled={data.page >= data.pages} onClick={() => load(data.page + 1)} className={`${btnSecondary} disabled:opacity-40`}>→</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default UsersPage;