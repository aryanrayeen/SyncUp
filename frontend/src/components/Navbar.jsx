import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { LogOut, User, Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
	const { user, logout } = useAuthStore();

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="navbar bg-base-100 shadow-lg border-b border-base-300">
			<div className="flex-1">
				<a className="btn btn-ghost text-xl font-bold text-primary">SyncUp</a>
			</div>
			
			{/* Search Bar */}
			<div className="flex-none gap-2">
				<div className="form-control">
					<div className="input-group">
						<input 
							type="text" 
							placeholder="Search..." 
							className="input input-bordered input-sm w-48" 
						/>
						<button className="btn btn-square btn-sm">
							<Search className="w-4 h-4" />
						</button>
					</div>
				</div>
				
				{/* Notifications */}
				<button className="btn btn-ghost btn-circle">
					<div className="indicator">
						<Bell className="w-5 h-5" />
						<span className="badge badge-xs badge-primary indicator-item"></span>
					</div>
				</button>
				
				{/* User Profile Dropdown */}
				<div className="dropdown dropdown-end">
					<div tabIndex={0} role="button" className="btn btn-ghost btn-circle flex items-center justify-center">
						<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
							<User className="w-5 h-5 text-primary-content" />
						</div>
					</div>
					<ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
						<li>
							<a className="justify-between">
								{user?.name}
								{/* <span className="badge badge-primary">Pro</span> */}
							</a>
						</li>
						<li><a>Settings</a></li>
						<li><a>Help</a></li>
						<li>
							<Link to="/weekly-summary">Weekly Summary</Link>
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
