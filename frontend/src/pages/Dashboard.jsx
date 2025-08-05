import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import { User, LogOut, Activity, TrendingUp, DollarSign, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
	const { user, logout, checkAuth, isLoading } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
				>
					<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<User className="size-8" />
								<div>
									<h1 className="text-2xl font-bold">Welcome to SyncUp!</h1>
									<p className="text-purple-100">Hello, {user?.name}</p>
								</div>
							</div>
							<button
								onClick={handleLogout}
								className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition-colors"
							>
								<LogOut className="size-4" />
								<span>Logout</span>
							</button>
						</div>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div className="bg-gray-50 rounded-lg p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-2">Profile</h3>
								<div className="space-y-2">
									<p><span className="font-medium">Name:</span> {user?.name}</p>
									<p><span className="font-medium">Email:</span> {user?.email}</p>
									<p><span className="font-medium">Member Since:</span> {new Date(user?.createdAt).toLocaleDateString()}</p>
									{user?.lastLogin && (
										<p><span className="font-medium">Last Login:</span> {new Date(user?.lastLogin).toLocaleString()}</p>
									)}
								</div>
							</div>

							<div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
									<Activity className="mr-2 text-purple-600" size={20} />
									Fitness Tracking
								</h3>
								<div className="space-y-3">
									<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
										Log Workout
									</button>
									<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
										Track Progress
									</button>
									<button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
										Set Fitness Goals
									</button>
								</div>
							</div>

							<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
									<TrendingUp className="mr-2 text-green-600" size={20} />
									Wellness
								</h3>
								<div className="space-y-3">
									<button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
										Mood Tracker
									</button>
									<button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
										Sleep Log
									</button>
									<button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
										Nutrition Diary
									</button>
								</div>
							</div>

							<div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
									<DollarSign className="mr-2 text-orange-600" size={20} />
									Expense Tracking
								</h3>
								<div className="space-y-3">
									<button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
										Add Expense
									</button>
									<button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
										View Budget
									</button>
									<button className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors">
										Monthly Report
									</button>
								</div>
							</div>

							<div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
									<Target className="mr-2 text-pink-600" size={20} />
									Goals & Habits
								</h3>
								<div className="space-y-3">
									<button className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors">
										Set New Goal
									</button>
									<button className="w-full bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors">
										Track Habits
									</button>
									<button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
										View Progress
									</button>
								</div>
							</div>

							<div className="bg-gray-50 rounded-lg p-4">
								<h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
								<div className="space-y-3">
									<button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
										Edit Profile
									</button>
									<button className="w-full bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
										Settings
									</button>
									<button className="w-full bg-zinc-600 text-white py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors">
										Help & Support
									</button>
								</div>
							</div>
						</div>

						<div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
							<h3 className="text-lg font-semibold text-purple-800 mb-2">🎉 Welcome to Your Wellness Journey!</h3>
							<p className="text-purple-700">
								You've successfully joined SyncUp! Start tracking your fitness, monitor your wellness, 
								manage your expenses, and achieve your personal goals all in one place. 
								Your path to a healthier and more organized lifestyle begins now!
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Dashboard;
