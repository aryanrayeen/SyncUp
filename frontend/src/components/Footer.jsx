const Footer = () => {
	return (
		<footer className="bg-gray-800 text-white py-8 mt-auto">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="text-xl font-bold text-purple-400 mb-4">SyncUp</h3>
						<p className="text-gray-300">
							Your personal companion for fitness tracking, wellness monitoring, and expense management.
						</p>
					</div>
					
					<div>
						<h4 className="text-lg font-semibold mb-4">Features</h4>
						<ul className="space-y-2">
							<li>
								<a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
									Fitness Tracking
								</a>
							</li>
							<li>
								<a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
									Wellness Monitoring
								</a>
							</li>
							<li>
								<a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
									Expense Management
								</a>
							</li>
						</ul>
					</div>
					
					<div>
						<h4 className="text-lg font-semibold mb-4">Get Started</h4>
						<ul className="space-y-2">
							<li>
								<a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
									Set Fitness Goals
								</a>
							</li>
							<li>
								<a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
									Track Progress
								</a>
							</li>
							<li>
								<a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
									Create Budget
								</a>
							</li>
						</ul>
					</div>
				</div>
				
				<div className="border-t border-gray-700 mt-8 pt-8 text-center">
					<p className="text-gray-300">
						© 2025 SyncUp. All rights reserved. Your journey to better health and finances starts here! 💪💰
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
