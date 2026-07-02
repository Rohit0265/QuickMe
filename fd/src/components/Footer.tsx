import React from 'react'
import { House, PlusSquare, User } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-900 py-2.5 px-6">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <Link to="/" className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95">
          <House className="w-6.5 h-6.5" strokeWidth={2} />
        </Link>
        <Link to="/upload" className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95">
          <PlusSquare className="w-6.5 h-6.5" strokeWidth={2} />
        </Link>
        <Link to="/login" className="text-zinc-400 hover:text-white transition-all duration-200 p-2 rounded-full cursor-pointer active:scale-95">
          <User className="w-6.5 h-6.5" strokeWidth={2} />
        </Link>
      </div>
    </footer>
  )
}

export default Footer;