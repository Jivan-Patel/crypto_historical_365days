import { useState } from 'react';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../../../store/slices/authSlice';
import { loginSchema } from '../validations';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const resultAction = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success('Successfully logged in!');
        navigate('/');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 sm:text-sm transition-colors ${
              formik.touched.email && formik.errors.email
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
            placeholder="you@example.com"
          />
        </div>
        {formik.touched.email && formik.errors.email ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {formik.errors.email}
          </p>
        ) : null}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`block w-full pl-10 pr-10 py-2 border rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 sm:text-sm transition-colors ${
              formik.touched.password && formik.errors.password
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {formik.touched.password && formik.errors.password ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {formik.errors.password}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
      </button>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
        </span>
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
