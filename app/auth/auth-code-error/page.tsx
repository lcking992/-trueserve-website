import Link from "next/link";

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 text-center">
            <div className="max-w-md w-full p-8 bg-slate-800 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <div className="text-6xl mb-6">Warning</div>
                <h1 className="text-3xl font-black text-white mb-4">Authentication Error</h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Something went wrong while trying to sign you in with Google.
                    This could be due to an expired session or a configuration issue in the Google Cloud Console.
                </p>
                <div className="space-y-4">
                    <Link href="/login" className="btn btn-primary w-full py-4 text-sm uppercase tracking-widest font-black">
                        Try Again
                    </Link>
                    <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm font-bold block">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
