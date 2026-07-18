function Spinner({ label = 'Loading...' }) {
    return (
        <div className="flex items-center gap-3 text-gray-500 py-8">
            <span className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-brand-600 animate-spin" />
            {label}
        </div>
    );
}

export default Spinner;