import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { user, logout, isAuthenticated } = useAuthStore();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<nav className="bg-white shadow-lg border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Link to="/" className="flex-shrink-0">
							<h1 className="text-2xl font-bold text-purple-600">SyncUp</h1>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-4">
						{isAuthenticated ? (
							<>
								<span className="text-gray-700">Welcome, {user?.name}!</span>
								<button
									onClick={handleLogout}
									className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
								>
									<LogOut size={20} />
									<span>Logout</span>
								</button>
							</>
						) : (
							<div className="flex space-x-4">
								<Link
									to="/login"
									className="text-gray-700 hover:text-purple-600 transition-colors"
								>
									Login
								</Link>
								<Link
									to="/signup"
									className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
								>
									Sign Up
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="text-gray-700 hover:text-green-600"
						>
							{isOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			{isOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
						{isAuthenticated ? (
							<>
								<div className="px-3 py-2 text-gray-700">Welcome, {user?.name}!</div>
								<button
									onClick={handleLogout}
									className="w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors flex items-center space-x-1"
								>
									<LogOut size={20} />
									<span>Logout</span>
								</button>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
									onClick={() => setIsOpen(false)}
								>
									Login
								</Link>
								<Link
									to="/signup"
									className="block px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mx-3"
									onClick={() => setIsOpen(false)}
								>
									Sign Up
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
