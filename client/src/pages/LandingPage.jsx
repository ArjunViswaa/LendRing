import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Step({ n, title, body }) {
    return (
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6">
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                {n}
            </div>
            <h3 className="mt-4 font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{body}</p>
        </div>
    );
}

function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* nav */}
            <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
                <span className="text-xl font-semibold text-brand-700">Lend-Ring</span>
                <nav className="flex items-center gap-3 text-sm">
                    {user ? (
                        <Link to="/dashboard" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
                            Go to dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-700 hover:text-gray-900">Log in</Link>
                            <Link to="/register" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
                                Get started
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* hero */}
            <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-12">
                <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight">
                    Rent what you need from people nearby
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    Cameras, tools, camping gear and more — borrow from neighbours instead of buying.
                    Lenders earn from things they already own, with every deposit held safely until a
                    safe return.
                </p>
                <div className="mt-8 flex gap-3 justify-center">
                    <Link to="/register" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
                        Start renting
                    </Link>
                    <Link to="/register" className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
                        Lend your items
                    </Link>
                </div>
            </section>

            {/* how it works */}
            <section className="max-w-5xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-semibold text-center text-gray-900">How it works</h2>
                <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <Step n="1" title="Find an item" body="Browse listings near you and pick your rental dates. See the daily rate and refundable deposit up front." />
                    <Step n="2" title="Book & pay securely" body="Request a booking. Once the lender approves, pay the rent plus a deposit through our secure gateway." />
                    <Step n="3" title="Return & get refunded" body="Use the item, return it on time, and your full deposit comes straight back. Rate each other to build trust." />
                </div>
            </section>

            {/* trust strip */}
            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="rounded-xl bg-white border border-gray-200 p-8 grid sm:grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-2xl font-semibold text-brand-700">Secure deposits</p>
                        <p className="mt-1 text-sm text-gray-600">Held by the platform, refunded on safe return</p>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold text-brand-700">Trust scores</p>
                        <p className="mt-1 text-sm text-gray-600">Built from real reviews and reliable returns</p>
                    </div>
                    <div>
                        <p className="text-2xl font-semibold text-brand-700">Fair disputes</p>
                        <p className="mt-1 text-sm text-gray-600">Damage handled transparently by our team</p>
                    </div>
                </div>
            </section>

            <footer className="text-center text-sm text-gray-400 py-8">
                Lend-Ring — a peer-to-peer rental marketplace
            </footer>
        </div>
    );
}

export default LandingPage;