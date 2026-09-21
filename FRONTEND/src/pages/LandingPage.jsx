import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Monitor, Users, BookOpen, Award, Play, Star,
  Clock, Video, Search, ChevronDown, CheckCircle2,
  TrendingUp, Laptop, PenTool, PieChart, Shield, GraduationCap,
  LayoutGrid, Mail, CheckCircle, Heart, Bookmark, Facebook, Instagram, Twitter, Linkedin,
  Atom, Figma, Apple, PlayCircle, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LandingNavbar = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const scrollTimeout = React.useRef(null);
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > 50) {
        if (currentScrollY > lastScrollY.current) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setVisible(true);
        }, 400);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <header className={`w-full bg-white fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'} ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Edu<span className="text-gray-900">Flow</span></span>
          </Link>
          <button className="hidden lg:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-100 transition-colors">
            <LayoutGrid size={16} />
            Category
          </button>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          <Link to="#" className="flex items-center gap-1 text-blue-600 font-semibold text-sm">Demos <ChevronDown size={14} /></Link>
          <Link to="#" className="flex items-center gap-1 text-gray-600 font-semibold text-sm hover:text-blue-600 transition-colors">Pages <ChevronDown size={14} /></Link>
          <Link to="#" className="flex items-center gap-1 text-gray-600 font-semibold text-sm hover:text-blue-600 transition-colors">Accounts <ChevronDown size={14} /></Link>
          <Link to="#" className="flex items-center gap-1 text-gray-600 font-semibold text-sm hover:text-blue-600 transition-colors">Megamenu <ChevronDown size={14} /></Link>
          <span className="text-gray-400 cursor-pointer">•••</span>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm w-40 text-gray-700 placeholder-gray-400" />
            <Search size={16} className="text-gray-400" />
          </div>
          
          {isLoggedIn ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => navigate(user?.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard')}>
              <img src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-5 py-2 bg-gray-900 text-white rounded-md font-semibold text-sm hover:bg-gray-800 transition-colors shadow-sm">
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const LandingFooter = () => (
  <footer className="bg-slate-50 pt-16 pb-8 border-t border-gray-200">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">EduFlow</span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
            EduFlow education theme, built specifically for the education centers which is dedicated to teaching and involve learners.
          </p>
          <div className="flex gap-3">
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
        <p className="text-gray-500 text-sm">Copyrights © {new Date().getFullYear()} EduFlow. Built with ❤️</p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a href="#" className="flex items-center gap-1 hover:text-gray-900"><Globe size={14}/> Language</a>
          <a href="#" className="hover:text-gray-900">Terms of use</a>
          <a href="#" className="hover:text-gray-900">Privacy policy</a>
        </div>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Development');

    const allCourses = {
    "Web Design": [
      { title: "HTML/CSS Bootcamp", bg: "bg-orange-50", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg", badge: "Beginner", badgeColor: "bg-emerald-100 text-emerald-600", rating: "4.8", time: "10h 30m", lectures: 25 },
      { title: "Advanced UI/UX", bg: "bg-blue-50", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg", badge: "Intermediate", badgeColor: "bg-blue-100 text-blue-600", rating: "4.7", time: "14h 00m", lectures: 40 },
    ],
    "Development": [
      { title: "The Complete Web Development in python", bg: "bg-gradient-to-br from-cyan-900 to-teal-500", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", badge: "Beginner", badgeColor: "bg-emerald-100 text-emerald-600", rating: "4.5", time: "10h 00m", lectures: 26 },
      { title: "Angular - The Complete Guider", bg: "bg-red-500", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg", badge: "Intermediate", badgeColor: "bg-blue-100 text-blue-600", rating: "4.5", time: "9h 32m", lectures: 42, liked: true },
      { title: "Deep Learning with React-Native", bg: "bg-cyan-100", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", badge: "Beginner", badgeColor: "bg-emerald-100 text-emerald-600", rating: "4.0", time: "18h 56m", lectures: 99, liked: true },
      { title: "JavaScript: Full Understanding", bg: "bg-yellow-200", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", badge: "All level", badgeColor: "bg-purple-100 text-purple-600", rating: "5.0", time: "35h 20m", lectures: 89 },
      { title: "Bootstrap 5 From Scratch", bg: "bg-purple-200", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg", badge: "Intermediate", badgeColor: "bg-blue-100 text-blue-600", rating: "4.2", time: "5h 20m", lectures: 12, liked: true },
      { title: "PHP with - CMS Project", bg: "bg-slate-700", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg", badge: "Beginner", badgeColor: "bg-emerald-100 text-emerald-600", rating: "4.1", time: "11h 10m", lectures: 30 }
    ],
    "Graphic Design": [
      { title: "Sketch from A to Z: for app designer", bg: "bg-orange-200", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sketch/sketch-original.svg", badge: "All level", badgeColor: "bg-purple-100 text-purple-600", rating: "4.0", time: "12h 56m", lectures: 15 },
      { title: "Learn Invision", bg: "bg-rose-500", img: "https://ui-avatars.com/api/?name=in&background=ff3366&color=fff&font-size=0.6&rounded=true&bold=true", badge: "All level", badgeColor: "bg-purple-100 text-purple-600", rating: "3.5", time: "6h 56m", lectures: 82, liked: true },
      { title: "Graphic Design Masterclass", bg: "bg-slate-800", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-plain.svg", badge: "Beginner", badgeColor: "bg-emerald-100 text-emerald-600", rating: "4.5", time: "9h 56m", lectures: 65, liked: true },
      { title: "Create a Design System in Figma", bg: "bg-rose-200", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg", badge: "Beginner", badgeColor: "bg-emerald-100 text-emerald-600", rating: "4.5", time: "5h 56m", lectures: 32 }
    ],
    "Marketing": [
      { title: "Digital Marketing Masterclass", bg: "bg-slate-800", img: "https://ui-avatars.com/api/?name=%3E&background=0ea5e9&color=fff&font-size=0.6&rounded=false&bold=true", badge: "Beginner", badgeColor: "bg-emerald-100 text-emerald-600", rating: "4.5", time: "6h 56m", lectures: 82, liked: true },
      { title: "Sketch from A to Z: for app designer", bg: "bg-orange-200", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sketch/sketch-original.svg", badge: "All level", badgeColor: "bg-purple-100 text-purple-600", rating: "4.0", time: "12h 56m", lectures: 15 }
    ],
    "Finance": [
      { title: "Learn Invision", bg: "bg-rose-500", img: "https://ui-avatars.com/api/?name=in&background=ff3366&color=fff&font-size=0.6&rounded=true&bold=true", badge: "All level", badgeColor: "bg-purple-100 text-purple-600", rating: "3.5", time: "6h 56m", lectures: 82, liked: true },
      { title: "JavaScript: Full Understanding", bg: "bg-yellow-200", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", badge: "All level", badgeColor: "bg-purple-100 text-purple-600", rating: "5.0", time: "35h 20m", lectures: 89 }
    ]
  };

  const trendCourses = [
    { title: "Time Management Mastery: Do More, Stress Less", img: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80", badge: "Design", level: "Beginner", rating: "4.5", time: "24h 56m", lectures: 55, price: "$500", author: "Lori Stevens", avatar: "A" },
    { title: "Build Responsive Websites with HTML", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80", badge: "Design", level: "Beginner", rating: "4.0", time: "09h 56m", lectures: 21, price: "$250", author: "Frances Guerrero", avatar: "B" },
    { title: "The complete Digital Marketing Course - 8 Course in 1", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80", badge: "Design", level: "Beginner", rating: "4.5", time: "6h 56m", lectures: 82, price: "Free", author: "Larry Lawson", avatar: "C" },
    { title: "Python for Data Science and Machine Learning", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", badge: "Development", level: "Intermediate", rating: "4.8", time: "18h 30m", lectures: 42, price: "$300", author: "Jane Doe", avatar: "D" },
    { title: "Advanced UI/UX Principles", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80", badge: "Design", level: "All level", rating: "4.9", time: "12h 00m", lectures: 35, price: "$200", author: "Alice Smith", avatar: "E" },
    { title: "Fullstack Web Development Bootcamp", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", badge: "Development", level: "Beginner", rating: "4.7", time: "45h 15m", lectures: 120, price: "$450", author: "John Wick", avatar: "F" }
  ];

  const trendScrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (trendScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = trendScrollRef.current;
        const itemWidth = clientWidth >= 1024 ? clientWidth / 3 : clientWidth >= 768 ? clientWidth / 2 : clientWidth;
        const oneSetWidth = scrollWidth / 3;
        
        if (scrollLeft >= (oneSetWidth * 2) - itemWidth) {
          trendScrollRef.current.scrollTo({ left: scrollLeft - oneSetWidth, behavior: 'instant' });
          setTimeout(() => {
             if (trendScrollRef.current) {
               trendScrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
             }
          }, 50);
        } else {
          trendScrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col overflow-x-hidden">
      <LandingNavbar />

      <main className="flex-1 pt-[72px]">
        
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="relative pt-16 pb-12 lg:pt-24 lg:pb-20 overflow-hidden">
          <div className="absolute top-20 left-10 w-8 h-8 rounded-full bg-orange-200 opacity-60 blur-[2px]"></div>
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4">
              
              <motion.div className="w-full lg:w-5/12 text-center lg:text-left pt-10" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <h1 className="text-[2.8rem] lg:text-[4rem] font-extrabold text-gray-900 leading-[1.1] mb-6">
                  Limitless learning at your{' '}
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10">fingertips</span>
                    <svg className="absolute w-full h-auto left-0 -bottom-2 -z-10 text-yellow-400" viewBox="0 0 300 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 25C70 10 150 5 295 15" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                      <path d="M15 20C80 5 160 5 285 22" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                    </svg>
                  </span>
                </h1>
                
                <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Online learning and teaching marketplace with 5K+ courses & 10M students. Taught by experts to help you acquire new skills.
                </p>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mb-10 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2"><CheckCircle size={18} className="fill-gray-800 text-white" /> Learn with experts</div>
                  <div className="flex items-center gap-2"><CheckCircle size={18} className="fill-gray-800 text-white" /> Get certificate</div>
                  <div className="flex items-center gap-2"><CheckCircle size={18} className="fill-gray-800 text-white" /> Get membership</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-3.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-md font-bold transition-all shadow-sm">
                    Get Started
                  </button>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Play size={18} fill="white" className="text-white ml-1" />
                    </div>
                    <span className="font-bold text-gray-900">Watch video</span>
                  </button>
                </div>
              </motion.div>

              <motion.div className="w-full lg:w-6/12 relative mt-10 lg:mt-0 flex justify-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="absolute inset-0 bg-[#1e293b] rounded-full scale-[0.85] origin-center -z-10 translate-y-4"></div>
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop" alt="Student" className="relative z-10 w-full max-w-[450px] h-auto object-cover object-top rounded-b-full scale-110 drop-shadow-2xl" style={{ clipPath: 'circle(45% at 50% 50%)' }} />
                
                <div className="absolute top-24 left-4 bg-white p-3 rounded-xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '4s' }}><Atom size={28} className="text-indigo-600" /></div>
                <div className="absolute bottom-32 -right-4 bg-white p-3 rounded-xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}><Figma size={24} className="text-rose-500" /></div>

                <div className="absolute top-1/4 right-0 lg:-right-10 bg-emerald-500 rounded-xl p-4 shadow-xl z-20 overflow-hidden">
                   <h4 className="text-white font-bold text-sm mb-3 relative z-10">Our daily new students</h4>
                   <div className="flex items-center -space-x-2 relative z-10">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=A" className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-white" />
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=B" className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-white" />
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=C" className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-white" />
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=D" className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-white" />
                     <div className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1K+</div>
                   </div>
                </div>

                <div className="absolute bottom-16 left-0 lg:-left-12 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-2xl z-30 flex items-center gap-4 border border-white/50">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Mail size={18} fill="white" className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm">Congratulations</h4>
                      <CheckCircle2 size={14} className="text-emerald-500" fill="currentColor" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Your admission completed</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        
        <motion.section className="py-8 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl bg-[#fdf6e3] hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><Monitor size={28} className="text-amber-500" /></div>
                <div><h3 className="text-[1.35rem] font-bold text-gray-900 leading-tight">10K</h3><p className="text-[13px] text-gray-600 font-medium">Online Courses</p></div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-slate-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><Users size={28} className="text-slate-700" fill="currentColor" /></div>
                <div><h3 className="text-[1.35rem] font-bold text-gray-900 leading-tight">200+</h3><p className="text-[13px] text-gray-600 font-medium">Expert Tutors</p></div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-purple-50 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"><GraduationCap size={28} className="text-purple-600" fill="currentColor" /></div>
                <div><h3 className="text-[1.35rem] font-bold text-gray-900 leading-tight">60K+</h3><p className="text-[13px] text-gray-600 font-medium">Online Students</p></div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-cyan-50 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0"><CheckCircle2 size={28} className="text-cyan-500" fill="currentColor" /></div>
                <div><h3 className="text-[1.35rem] font-bold text-gray-900 leading-tight">6K+</h3><p className="text-[13px] text-gray-600 font-medium">Certified Courses</p></div>
              </div>
            </div>
          </div>
        </motion.section>

        
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.1 }} className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-[2.5rem] font-bold text-gray-900 mb-4">Most Popular Courses</h2>
              <p className="text-gray-500 text-sm">Choose from hundreds of courses from specialist organizations</p>
            </div>

            <div className="bg-blue-50/70 p-2 rounded-xl flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mb-12">
              {Object.keys(allCourses).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {allCourses[activeTab].map((c, i) => (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "50px" }} transition={{ duration: 0.8, delay: i * 0.25 }} key={i} className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform">
                  <div className={`h-48 ${c.bg} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    {c.img ? (
                      <img src={c.img} alt={c.title} className="w-16 h-16 relative z-10 drop-shadow-md object-contain" />
                    ) : (
                      <c.icon size={64} className="text-white relative z-10 drop-shadow-md" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${c.badgeColor}`}>{c.badge}</span>
                      <Heart size={16} className={c.liked ? "text-red-500 fill-red-500" : "text-gray-400"} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 leading-snug mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">{c.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">Proposal indulged no do sociable he throwing settling. Rooms oh fully taken by worse do.</p>
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-amber-400 fill-amber-400" />)}
                      <span className="text-sm text-gray-700 font-semibold ml-1">{c.rating}/5.0</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-[13px] text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5"><Clock size={14} className="text-red-500"/> {c.time}</div>
                      <div className="flex items-center gap-1.5"><LayoutGrid size={14} className="text-orange-500"/> {c.lectures} lectures</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        
        <motion.section initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.2 }} className="py-10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="bg-[#0dcaf0] rounded-2xl p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-10 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-1/4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
              
              <div className="md:w-2/3 relative z-10 text-center md:text-left">
                <h2 className="text-3xl lg:text-[2.5rem] font-bold text-white mb-3">Become an Instructor!</h2>
                <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
                  Speedily say has suitable disposal add boy. On forth doubt miles of child. Exercise joy man children rejoiced. Yet uncommonly his ten who diminution astonished.
                </p>
              </div>
              <div className="md:w-1/3 flex justify-center md:justify-end relative z-10">
                <button onClick={() => navigate('/signup')} className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white rounded-md font-semibold transition-colors">
                  Start Teaching Today
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.1 }} className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-[2.5rem] font-bold text-gray-900 mb-4">Our Trending Courses</h2>
              <p className="text-gray-500 text-sm">Check out most 🔥 courses in the market</p>
            </div>

              <div ref={trendScrollRef} className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[...trendCourses, ...trendCourses, ...trendCourses].map((c, i) => (
                  <div key={i} className="min-w-[100%] md:min-w-[calc(50%-16px)] lg:min-w-[calc(33.333%-21px)] shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform">
                  <div className="relative h-[220px]">
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                      Free
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded">{c.badge}</span>
                        <span className="bg-gray-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">{c.level}</span>
                      </div>
                      <Bookmark size={16} className="text-gray-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 leading-snug mb-4 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">{c.title}</h4>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 font-bold text-sm">{c.rating}</span>
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-gray-500 ml-1">(2000)</span>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold text-right flex-1">{i === 0 ? '8000' : i === 1 ? '1200' : '6500'} (Student)</span>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-[13px] text-gray-600 font-medium mb-5">
                      <div className="flex items-center gap-1.5"><Clock size={14} className="text-red-500"/> {c.time}</div>
                      <div className="flex items-center gap-1.5"><LayoutGrid size={14} className="text-orange-500"/> {c.lectures} lectures</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.avatar}`} className="w-8 h-8 rounded-full bg-gray-100" />
                        <span className="text-sm font-semibold text-gray-700">{c.author}</span>
                      </div>
                      {c.price === "Free" ? (
                        <span className="text-emerald-500 font-bold text-xl">Free</span>
                      ) : (
                        <span className="text-emerald-500 font-bold text-xl">{c.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.2 }} className="py-16 pb-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              <div className="w-full lg:w-1/2 relative h-[500px]">
                <div className="absolute top-10 left-10 w-48 h-48 bg-red-50 rounded-full -z-10"></div>
                
                
                <div className="absolute top-20 left-0 lg:-left-4 bg-white p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-72 z-10 border border-gray-50">
                  <div className="flex justify-center mb-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carolyn" className="w-16 h-16 rounded-full bg-pink-100 border-2 border-white shadow-sm" />
                  </div>
                  <p className="text-sm text-gray-500 text-center italic mb-4 leading-relaxed">
                    "Moonlight newspaper up its enjoyment agreeable depending. Timed voice share led him to widen noisy young. At weddings believed laughing"
                  </p>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <h5 className="font-bold text-gray-900 text-center text-sm">Carolyn Ortiz</h5>
                </div>

                
                <div className="absolute bottom-10 right-4 lg:right-10 bg-white p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-72 z-20 border border-gray-50">
                  <div className="flex justify-center mb-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dennis" className="w-16 h-16 rounded-full bg-blue-100 border-2 border-white shadow-sm" />
                  </div>
                  <p className="text-sm text-gray-500 text-center italic mb-4 leading-relaxed">
                    "At weddings believed laughing although the Moonlight newspaper up its enjoyment agreeable depending."
                  </p>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <h5 className="font-bold text-gray-900 text-center text-sm">Dennis Barrett</h5>
                </div>

                
                <div className="absolute top-10 right-10 bg-white p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-0 border border-gray-50 w-56">
                  <h6 className="font-bold text-gray-900 text-xs mb-3">100+ Verified Mentors</h6>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lori" className="w-8 h-8 rounded bg-red-100" />
                      <div><p className="text-xs font-bold text-gray-900 leading-tight">Lori Stevens</p><p className="text-[10px] text-gray-500">Tutor of physic</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Billy" className="w-8 h-8 rounded bg-blue-100" />
                      <div><p className="text-xs font-bold text-gray-900 leading-tight">Billy Vasquez</p><p className="text-[10px] text-gray-500">Tutor of chemistry</p></div>
                    </div>
                  </div>
                </div>

                
                <div className="absolute bottom-32 left-10 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-30 text-center w-40 border-2 border-white transform -rotate-3">
                  <h3 className="font-bold text-xl mb-1">4.5/5.0</h3>
                  <div className="flex justify-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-[10px]">Based on 3265 ratings</p>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <h2 className="text-[2.5rem] font-bold text-gray-900 leading-tight mb-6">
                  Some valuable feedback from our students
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Supposing so be resolving breakfast am or perfectly. It drew a hill from me. Valley by oh twenty direct me so. Departure defective arranging rapturous did believe him all had supported. Family months lasted simple set nature vulgar him. Picture for attempt joy excited ten carried manners talking how.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors shadow-sm">
                  View Reviews
                </button>
              </div>

            </div>
          </div>
        </motion.section>

      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
