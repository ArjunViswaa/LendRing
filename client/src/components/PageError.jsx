function PageError({ message = 'Something went wrong' }) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {message}
        </div>
    );
}

export default PageError;