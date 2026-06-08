import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Folder } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/catalog', label: 'Каталог', icon: Library },
  { path: '/my-list', label: 'Мои коллекции', icon: Folder },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className={`bottom-nav-link ${location.pathname === path ? 'active' : ''}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
