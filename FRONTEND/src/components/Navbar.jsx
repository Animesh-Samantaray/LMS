import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  Moon,
  Sun,
  Sparkles,
  Leaf,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import TwoFactorToggle from "./TwoFactorToggle";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const themeOptions = [
    { id: "dark", label: "Dark", icon: Moon, desc: "Deep glassmorphism" },
    { id: "light", label: "Light", icon: Sun, desc: "Crisp soft glass" },
    { id: "cream", label: "Cream", icon: Sparkles, desc: "Warm pastel glass" },
    { id: "eco", label: "Eco", icon: Leaf, desc: "MongoDB green & white" },
  ];

  const isLoggedIn = Boolean(user?.role);

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/" + anchorId);
      return;
    }

    if (anchorId.startsWith("#")) {
      const element =
        document.querySelector(anchorId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  };

  const handleDashboard = () => {
    if (!user?.role) return;

    if (user.role === "Student") {
      navigate("/student/dashboard");
    } else if (user.role === "Instructor") {
      navigate("/instructor/dashboard");
    } else if (user.role === "Admin") {
      navigate("/admin/dashboard");
    }

    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 ">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        



        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-1 group relative z-10"
        >
          <img src="/shnoor-logo.png" alt="SHNOOR" className="h-[40px] object-contain" />
          <span className="text-2xl font-extrabold text-white tracking-tight ml-1">LMS</span>
        </Link>

        



        <nav className="hidden lg:block">
          <ul className="flex items-center gap-7">

            <li>
              <Link
                to="/"
                className="
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:text-white
                "
              >
                Home
              </Link>
            </li>

            <li>
              <a
                href="#courses"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#courses");
                }}
                className="
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:text-white
                "
              >
                Courses
              </a>
            </li>

            <li>
              <a
                href="#features"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#features");
                }}
                className="
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:text-white
                "
              >
                Features
              </a>
            </li>

            <li>
              <a
                href="#about"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#about");
                }}
                className="
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:text-white
                "
              >
                About
              </a>
            </li>

            <li>
              <a
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#contact");
                }}
                className="
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:text-white
                "
              >
                Contact
              </a>
            </li>

          </ul>
        </nav>

        



        <div className="hidden items-center gap-3 lg:flex">

          {isLoggedIn ? (
            <>
              



              <div className="relative group">
                <TwoFactorToggle
                  user={user}
                  setUser={setUser}
                />

                
                <div
                  className="
                    pointer-events-none
                    absolute right-0 top-full
                    z-50 mt-2
                    w-max max-w-[220px]
                    rounded-lg
                    border border-white/10
                    bg-slate-900
                    px-3 py-2
                    text-xs
                    text-slate-300
                    opacity-0
                    shadow-xl
                    transition-all
                    duration-200
                    group-hover:opacity-100
                  "
                >
                  {user.twoFactorEnabled
                    ? "2FA is enabled"
                    : "2FA is disabled"}
                </div>
              </div>

              



              <motion.button
                type="button"
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={handleDashboard}
                className="
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-purple-600
                  px-4 py-2
                  text-sm font-semibold
                  text-white
                  shadow-lg
                  shadow-purple-500/20
                  transition
                  hover:from-violet-500
                  hover:to-purple-500
                "
              >
                Dashboard
              </motion.button>
            </>
          ) : (
            <>
              

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() =>
                  navigate("/login")
                }
                className="
                  rounded-xl
                  border border-slate-700
                  bg-slate-900/60
                  px-4 py-2
                  text-sm font-medium
                  text-slate-200
                  transition
                  hover:border-violet-400/40
                  hover:text-white
                "
              >
                Login
              </motion.button>

              

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.03,
                  boxShadow:
                    "0 10px 30px rgba(139,92,246,0.25)",
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() =>
                  navigate("/signup")
                }
                className="
                  flex items-center gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-purple-600
                  px-4 py-2
                  text-sm font-semibold
                  text-white
                "
              >
                Get Started
                <ArrowRight size={16} />
              </motion.button>
            </>
          )}

    
          <div className="relative ml-1" ref={themeDropdownRef}>
            <button
              type="button"
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-sm"
              aria-label="Select theme"
              title="Select theme"
            >
              {theme === "dark" ? (
                <Moon size={16} className="text-indigo-400" />
              ) : theme === "cream" ? (
                <Sparkles size={16} className="text-amber-500" />
              ) : theme === "eco" ? (
                <Leaf size={16} className="text-emerald-500" />
              ) : (
                <Sun size={16} className="text-amber-500" />
              )}
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Theme Mode
                </div>
                {themeOptions.map((opt) => {
                  const isSelected = theme === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTheme(opt.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={opt.id === "eco" ? "text-emerald-500" : opt.id === "dark" ? "text-indigo-400" : "text-amber-500"} />
                        <div className="text-left">
                          <p className="leading-tight">{opt.label}</p>
                          <p className="text-[9px] opacity-70">{opt.desc}</p>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="shrink-0 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        



        <motion.button
          type="button"
          whileTap={{
            scale: 0.9,
          }}
          onClick={() =>
            setMobileMenuOpen(
              (previous) => !previous
            )
          }
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            border border-slate-700
            bg-slate-900
            text-slate-200
            lg:hidden
          "
          aria-label="Toggle navigation menu"
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{
                  rotate: -90,
                  opacity: 0,
                }}
                animate={{
                  rotate: 0,
                  opacity: 1,
                }}
                exit={{
                  rotate: 90,
                  opacity: 0,
                }}
              >
                <X size={23} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{
                  rotate: 90,
                  opacity: 0,
                }}
                animate={{
                  rotate: 0,
                  opacity: 1,
                }}
                exit={{
                  rotate: -90,
                  opacity: 0,
                }}
              >
                <Menu size={23} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      



      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              overflow-hidden
              border-t border-white/10
              bg-slate-950/95
              lg:hidden
            "
          >
            <div
              className="
                mx-auto
                flex max-w-7xl
                flex-col gap-2
                px-4 py-5
                sm:px-6
              "
            >

              

              <Link
                to="/"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="
                  rounded-xl
                  px-4 py-3
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Home
              </Link>

              

              <a
                href="#courses"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#courses");
                }}
                className="
                  rounded-xl
                  px-4 py-3
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Courses
              </a>

              

              <a
                href="#features"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#features");
                }}
                className="
                  rounded-xl
                  px-4 py-3
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Features
              </a>

              

              <a
                href="#about"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#about");
                }}
                className="
                  rounded-xl
                  px-4 py-3
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                About
              </a>

              

              <a
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#contact");
                }}
                className="
                  rounded-xl
                  px-4 py-3
                  text-sm font-medium
                  text-slate-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Contact
              </a>

              



              {isLoggedIn ? (
                <div
                  className="
                    mt-3
                    border-t border-white/10
                    pt-4
                  "
                >

                  

                  <div
                    className="
                      flex items-center
                      justify-between
                      rounded-xl
                      border border-white/10
                      bg-slate-900/80
                      px-4 py-3
                    "
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Two-Factor Authentication
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {user.twoFactorEnabled
                          ? "Your account is protected"
                          : "Your account is not protected"}
                      </p>
                    </div>

                    <TwoFactorToggle
                      user={user}
                      setUser={setUser}
                    />
                  </div>

                  

                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={handleDashboard}
                    className="
                      mt-3
                      flex w-full
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-r
                      from-violet-600
                      to-purple-600
                      px-4 py-3
                      text-sm font-semibold
                      text-white
                    "
                  >
                    Dashboard
                  </motion.button>
                </div>
              ) : (
                



                <div
                  className="
                    mt-3
                    flex flex-col gap-3
                    border-t border-white/10
                    pt-4
                  "
                >
                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="
                      w-full
                      rounded-xl
                      border border-slate-700
                      bg-slate-900
                      px-4 py-3
                      text-sm font-medium
                      text-slate-200
                    "
                  >
                    Login
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/signup");
                    }}
                    className="
                      flex w-full
                      items-center
                      justify-center gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-violet-600
                      to-purple-600
                      px-4 py-3
                      text-sm font-semibold
                      text-white
                    "
                  >
                    Get Started
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              )}

       
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  Theme Mode
                </div>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-xl border border-white/10">
                  {themeOptions.map((opt) => {
                    const isSelected = theme === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTheme(opt.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? "bg-white/15 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon size={14} className={opt.id === "eco" ? "text-emerald-500" : opt.id === "dark" ? "text-indigo-400" : "text-amber-500"} />
                        <span className="text-[10px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;