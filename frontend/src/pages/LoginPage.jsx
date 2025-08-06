import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import api from "../lib/axios";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { login, isLoading, error } = useAuthStore();

	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			await login(email, password);
			navigate("/dashboard");
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 via-yellow-50 to-green-100 p-4" data-theme="acid">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-base-100 backdrop-blur-xl rounded-2xl shadow-2xl border border-lime-200 overflow-hidden'
			>
				<div className='p-8'>
					<h2 className='text-3xl font-bold mb-6 text-center text-primary'>
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

						{error && <p className='text-error font-semibold mb-2'>{error}</p>}

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className='w-full btn btn-primary text-primary-content font-bold shadow-lg hover:btn-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-200'
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Log In"}
						</motion.button>
					</form>
				</div>
				<div className='px-8 py-4 bg-base-200 flex justify-center'>
					<p className='text-sm text-base-content/70'>
						Don't have an account?{" "}
						<Link to='/signup' className='text-primary hover:text-primary-focus font-semibold hover:underline'>
							Create Account
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default LoginPage;