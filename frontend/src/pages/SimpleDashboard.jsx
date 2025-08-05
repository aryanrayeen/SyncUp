import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const SimpleDashboard = () => {
	const { user, logout } = useAuthStore();

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-8"
				>
					<div className="text-center">
						<h1 className="text-3xl font-bold text-green-600 mb-4">
							Welcome to SyncUp
						</h1>
						<p className="text-gray-600 mb-8">
							Hello, {user?.name}! Your account has been successfully created.
						</p>
						
						<div className="space-y-4">
							<p className="text-gray-600">
								Dashboard functionality will be implemented soon.
							</p>
							
							<motion.button
								onClick={handleLogout}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
							>
								Logout
							</motion.button>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default SimpleDashboard;
