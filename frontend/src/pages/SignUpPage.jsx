import { motion } from "framer-motion";
import { useState } from "react";
import { User, Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	const handleSignUp = async (e) => {
		e.preventDefault();

		try {
			await signup(email, password, name);
			// Redirect new users to profile setup page instead of dashboard
			navigate("/profile-setup");
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
						Create Account
					</h2>

					<form onSubmit={handleSignUp}>
						<Input
							icon={User}
							type='text'
							placeholder='Full Name'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
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

						{error && <p className='text-error font-semibold mt-2'>{error}</p>}
						<PasswordStrengthMeter password={password} />

						<motion.button
							className='mt-5 w-full btn btn-primary text-primary-content font-bold shadow-lg hover:btn-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-200'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Sign Up"}
						</motion.button>
					</form>
				</div>
				<div className='px-8 py-4 bg-base-200 flex justify-center'>
					<p className='text-sm text-base-content/70'>
						Already have an account?{" "}
						<Link to={"/login"} className='text-primary hover:text-primary-focus font-semibold hover:underline'>
							Login
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default SignUpPage;