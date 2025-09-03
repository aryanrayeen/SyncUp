import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { LogOut, User, Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
	const { user, logout } = useAuthStore();
	const { unreadCount, requestNotificationPermission } = useNotificationStore();
	const [showNotifications, setShowNotifications] = useState(false);

	// Debug: Log user data to console
	console.log('Navbar - Current user:', user);
	console.log('Navbar - Profile picture:', user?.profilePicture ? 'Present' : 'Not present');

	// Request notification permission on component mount
	useEffect(() => {
		requestNotificationPermission();
	}, [requestNotificationPermission]);

	const handleLogout = () => {
		logout();
	};

	const toggleNotifications = () => {
		setShowNotifications(!showNotifications);
	};

	const closeNotifications = () => {
		setShowNotifications(false);
	};

	return (
		<div className="navbar bg-base-100 shadow-lg border-b border-base-300">
			<div className="flex-1">
				<a className="btn btn-ghost text-xl font-bold italic text-primary">SyncUp!</a>
			</div>
			
			{/* Notifications */}
			<div className="flex-none gap-2">
				<div className="relative">
					<button 
						className="btn btn-ghost btn-circle"
						onClick={toggleNotifications}
					>
						<div className="indicator">
							<Bell className="w-5 h-5" />
							{unreadCount > 0 && (
								<span className="badge badge-xs badge-primary indicator-item">
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							)}
						</div>
					</button>
					
					<NotificationDropdown 
						isOpen={showNotifications}
						onClose={closeNotifications}
					/>
				</div>
				
				{/* User Profile Dropdown */}
				<div className="dropdown dropdown-end">
					<div tabIndex={0} role="button" className="btn btn-ghost btn-circle flex items-center justify-center">
						{user?.profilePicture ? (
							<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
								<img 
									src={user.profilePicture} 
									alt="Profile" 
									className="w-full h-full object-cover"
								/>
							</div>
						) : (
							<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
								<User className="w-5 h-5 text-primary-content" />
							</div>
						)}
					</div>
					<ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
						<li>
							<Link to="/profile" className="justify-between">
								{user?.name}
							</Link>
						</li>
						<li>
							<Link to="/weekly-summary">Weekly Summary</Link>
						</li>
						<li>
							<Link to="/achievements">Achievements</Link>
						</li>
						<li>
							<button onClick={handleLogout} className="text-error">
								<LogOut className="w-4 h-4" />
								Logout
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
