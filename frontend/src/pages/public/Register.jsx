import RegisterForm from '../../features/auth/components/RegisterForm';

const Register = () => {
  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create an Account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Join us to track and analyze cryptocurrency markets
        </p>
      </div>
      <RegisterForm />
    </>
  );
};

export default Register;
