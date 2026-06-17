import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
        {/* Dynamic gradient blobs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-600/40 blur-[100px] animate-pulse" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/40 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[0%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl z-10" />

        <div className="relative z-20 p-12 text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-8">
            <span className="text-4xl font-bold text-white">C</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            CryptoAnalytics
          </h1>
          <p className="text-lg text-indigo-100 leading-relaxed">
            Your premier platform for real-time cryptocurrency insights, advanced market tracking, and intelligent portfolio management.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950 relative">
        {/* Subtle background noise/blobs for right side */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden dark:block">
          <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[80px]" />
        </div>
        
        <div className="w-full max-w-md relative z-10 glass-panel dark:bg-slate-900/60 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="text-center mb-10 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CryptoAnalytics</h1>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
