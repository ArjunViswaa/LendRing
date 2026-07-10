import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed, please try again');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8 flex flex-col gap-4"
            >
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </label>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 py-2.5 text-white font-medium hover:bg-gray-700 disabled:opacity-60"
                >
                    {submitting ? 'Logging in...' : 'Log in'}
                </button>

                <p className="text-sm text-center text-gray-600">
                    New here?{' '}
                    <Link to="/register" className="underline hover:text-gray-900">
                        Create an account
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;