import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-1">
                <img src="/shnoor-logo.png" alt="SHNOOR" className="h-[40px] object-contain" />
                <span className="text-2xl font-extrabold text-[#1f2937] tracking-tight ml-1">LMS</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
                SHNOOR LMS platform, built specifically for education centers which are dedicated to teaching and involve learners.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded bg-white shadow-sm flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
  
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact us</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">News and Blogs</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Library</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Career</a></li>
            </ul>
          </div>
  
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Community</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Faq</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Forum</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Sitemap</a></li>
            </ul>
          </div>
  
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Teaching</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Become a teacher</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">How to guide</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
  
        <div className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-gray-200 gap-4">
          <p className="text-gray-500 text-sm">Copyrights &copy; {new Date().getFullYear()} SHNOOR LMS. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="flex items-center gap-1 hover:text-gray-900"><Globe size={14}/> Language</a>
            <a href="#" className="hover:text-gray-900">Terms of use</a>
            <a href="#" className="hover:text-gray-900">Privacy policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
