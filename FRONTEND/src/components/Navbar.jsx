import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import TwoFactorToggle from "./TwoFactorToggle";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, setUser } = useAuth();

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        



        <Link
          to="/"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className="group flex items-center gap-2.5"
        >
          <motion.div
            whileHover={{
              rotate: -6,
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="
              flex h-10 w-10 items-center
              justify-center rounded-xl
              bg-gradient-to-br
              from-violet-500 to-purple-600
              shadow-lg shadow-purple-500/20
            "
          >
            <GraduationCap
              size={22}
              className="text-white"
            />
          </motion.div>

          <span className="text-xl font-bold tracking-tight text-white">
            Edu
            <span
              className="
                bg-gradient-to-r
                from-violet-400 to-purple-400
                bg-clip-text text-transparent
              "
            >
              Flow
            </span>
          </span>
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
              backdrop-blur-xl
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;