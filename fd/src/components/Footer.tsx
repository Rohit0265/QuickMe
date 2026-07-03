import { useState, useEffect } from 'react'
import { House, Search, PlusSquare, User, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-900 py-2.5 px-6">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <Link to="/" className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95">
          <House className="w-6.5 h-6.5" strokeWidth={2} />
        </Link>
        <Link to="/search" className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95">
          <Search className="w-6.5 h-6.5" strokeWidth={2} />
        </Link>
        <Link to="/upload" className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95">
          <PlusSquare className="w-6.5 h-6.5" strokeWidth={2} />
        </Link>
        <Link to="/user" className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95">
          <User className="w-6.5 h-6.5" strokeWidth={2} />
        </Link>
        <button
          onClick={toggleTheme}
          className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-6.5 h-6.5" strokeWidth={2} />
          ) : (
            <Moon className="w-6.5 h-6.5" strokeWidth={2} />
          )}
        </button>
      </div>
    </footer>
  )
}

export default Footer;