import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";


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
			<div className="flex flex-col items-center w-full max-w-md">
				{/* SyncUp Logo Branding */}
				<motion.div
					initial={{ opacity: 0, y: -50, scale: 0.8 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					className="mb-8 text-center"
				>
					<motion.h1 
						className="text-6xl font-bold italic mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse"
						initial={{ opacity: 0 }}
						animate={{ 
							opacity: 1,
							backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
						}}
						transition={{ 
							opacity: { duration: 1, delay: 0.5 },
							backgroundPosition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
						}}
						style={{
							backgroundSize: "200% 200%",
							backgroundImage: "linear-gradient(45deg, #a3e635, #22d3ee, #f59e0b, #ec4899, #8b5cf6, #a3e635)"
						}}
					>
						SyncUp!
					</motion.h1>
					<motion.p 
						className="text-lg text-primary/70 font-medium"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.8 }}
					>
						Your Life, Perfectly Synced
					</motion.p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 50, scale: 0.9 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
					className='w-full bg-base-100 backdrop-blur-xl rounded-2xl shadow-2xl border border-lime-200 overflow-hidden'
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
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.8 }}
							whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
							whileTap={{ scale: 0.95 }}
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
	</div>
	);
};
export default LoginPage;