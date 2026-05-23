export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br
        from-slate-900 via-slate-800 to-slate-900
        flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5" />
                <div className="relative z-10 text-center space-y-6">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary
              flex items-center justify-center">
              <span className="text-primary-foreground
                font-bold text-xl">E</span>
                        </div>
                        <span className="text-white text-2xl font-bold">Ebenezer</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Everything you ever wanted to know about your trading
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md">
                        Log every trade, analyze your performance, and build
                        the discipline that leads to consistent profits.
                    </p>
                    <div className="grid grid-cols-3 gap-6 mt-12">
                        {[
                            { label: 'Trades Logged', value: '20.5B+' },
                            { label: 'Active Traders', value: '100K+' },
                            { label: 'Avg Win Rate', value: '67%' },
                        ].map((stat) => (
                            <div key={stat.label}
                                 className="text-center p-4 rounded-xl
                  bg-white/5 border border-white/10">
                                <p className="text-2xl font-bold text-white">
                                    {stat.value}
                                </p>
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}