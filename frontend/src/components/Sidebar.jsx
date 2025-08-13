import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  Target, 
  DollarSign, 
  User,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Dumbbell, label: 'Fitness', path: '/trends' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: DollarSign, label: 'Expenses', path: '/expenses' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className={`bg-base-200 min-h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-base-300">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-sm w-full"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-content' 
                      : 'hover:bg-base-300 text-base-content'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
