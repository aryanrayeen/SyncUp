import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
			navigate("/");
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-white p-4">
			<div className="max-w-md w-full">
				<h1 className="text-4xl font-bold mb-8 text-center text-black">
					Welcome Back
				</h1>

				<form onSubmit={handleLogin} className="space-y-6">
					<div className="flex items-center border-b border-gray-300 pb-2">
						<svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						<input
							type="email"
							placeholder="Email Address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
							required
						/>
					</div>

					<div className="flex items-center border-b border-gray-300 pb-2">
						<svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
							required
						/>
					</div>

					{error && <p className='text-red-500 text-sm'>{error}</p>}

					<button
						type="submit"
						disabled={isLoading}
						className="px-6 py-2 bg-white border border-gray-300 text-black rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
					>
						{isLoading ? "Signing In..." : "Sign In"}
					</button>
				</form>

				<p className="mt-6 text-center text-gray-600">
					Don't have an account?{" "}
					<Link to="/signup" className="text-purple-600 hover:underline">
						Create Account
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
