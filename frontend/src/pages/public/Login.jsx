import LoginForm from '../../features/auth/components/LoginForm';

const Login = () => {
  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in to access your crypto portfolio and analytics
        </p>
      </div>
      <LoginForm />
    </>
  );
};

export default Login;
