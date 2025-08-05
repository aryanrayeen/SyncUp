import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { login, isLoading, error } = useAuthStore();

	const handleLogin = async (e) => {
		e.preventDefault();
		await login(email, password);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'
			>
				<div className='p-8'>
					<h2 className='text-3xl font-bold mb-6 text-center text-green-600'>
						Welcome Back
					</h2>

					<form onSubmit={handleLogin}>
						<Input
							icon={Mail}
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<Input
							icon={Lock}
							type='password'
							placeholder='Password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>

						{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className='w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white transition duration-200'
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Login"}
						</motion.button>
					</form>
				</div>
				<div className='px-8 py-4 bg-gray-50 flex justify-center'>
					<p className='text-sm text-gray-600'>
						Don't have an account?{" "}
						<Link to='/signup' className='text-green-600 hover:text-green-700 font-semibold hover:underline'>
							Sign up
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default LoginPage;