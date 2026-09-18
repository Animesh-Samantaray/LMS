import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalFrameBackground from '../components/GlobalFrameBackground';
import FeatureCard from '../components/FeatureCard';
import DashboardPreview from '../components/DashboardPreview';
import CertificateCard from '../components/CertificateCard';
import {
  BookOpen, Users, Video, FileText, CheckSquare, Award,
  BarChart3, Search, Star, Bell, MessageSquare, Shield,
  ArrowRight, CheckCircle2, Sparkles, Laptop, GraduationCap, Play, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/landing.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState('student');

  const featuresList = [
    { icon: Layers, title: "Course Management", description: "Seamlessly organize curriculum, modules, prerequisites, and learning paths." },
    { icon: BookOpen, title: "Course Enrollment", description: "Instant 1-click student self-enrollment or automated institution batch enrollments." },
    { icon: BarChart3, title: "Progress Tracking", description: "Real-time granular completion analytics for videos, readings, and milestones." },
    { icon: Video, title: "HD Video Lessons", description: "Adaptive bitrate video player with playback speed, auto-captions, and bookmarks." },
    { icon: FileText, title: "PDF & Resources", description: "Centralized repository for lecture slides, ebooks, code snippets, and lab guides." },
    { icon: CheckSquare, title: "Assignments Hub", description: "Rich text and file submission portal with deadline tracking and rubrics." },
    { icon: Sparkles, title: "Online Quizzes", description: "Timed assessments with multiple choice, code testing, and short answers." },
    { icon: Shield, title: "Automatic Scoring", description: "Instant automated grading engine with step-by-step breakdown feedback." },
    { icon: BarChart3, title: "Performance Analytics", description: "In-depth visual reports for students and instructors to spot gaps early." },
    { icon: Award, title: "Verified Certificates", description: "Shareable credentials with unique verification IDs and LinkedIn integration." },
    { icon: Search, title: "Smart Course Search", description: "Instant filtering by subject, difficulty, instructor, duration, and ratings." },
    { icon: Star, title: "Ratings & Reviews", description: "Transparent student reviews and ratings to guide course discovery." },
    { icon: Bell, title: "Smart Notifications", description: "Automated alerts for upcoming deadlines, quiz releases, and announcements." },
    { icon: MessageSquare, title: "Class Discussions", description: "Collaborative Q&A forums, thread replies, and direct peer-to-peer messaging." }
  ];

  const studentBenefits = [
    "Discover 1,000+ top-rated courses across STEM, Business, & Design",
    "Learn at your own pace with offline PDF guides and HD streaming",
    "Submit assignments with instant rubrics and teacher feedback",
    "Take interactive quizzes with immediate score breakdowns",
    "Track your daily study streak and percentage completion stats",
    "Earn industry-recognized certificates for your career resume"
  ];

  const instructorBenefits = [
    "Build modular courses with rich text, video, and quizzes in minutes",
    "Upload PDF resources, slide decks, and code repositories effortlessly",
    "Create timed quizzes with automated grading and custom pass thresholds",
    "Assign homework and review student submissions with built-in rubrics",
    "Monitor student drop-off points with visual engagement heatmaps",
    "Issue digital certificates automatically upon 100% course completion"
  ];

  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Senior Full Stack Student",
      avatar: "MV",
      quote: "EduFlow completely transformed how I learn. The progress tracking kept me motivated, and I landed a Software Engineer job within 3 months!",
      rating: 5
    },
    {
      name: "Dr. Aris Thorne",
      role: "Computer Science Professor",
      avatar: "AT",
      quote: "Managing 400+ students used to be exhausting. With automatic quiz scoring and built-in discussion boards, my teaching efficiency tripled.",
      rating: 5
    },
    {
      name: "Elena Rostova",
      role: "Data Science Specialist",
      avatar: "ER",
      quote: "The interactive dashboard and verified certificates gave my LinkedIn profile the edge it needed. Highly recommended for professionals!",
      rating: 5
    }
  ];

  return (
    <div className="landing-page" style={{ position: 'relative' }}>
      <GlobalFrameBackground />
      <div className="website-content" style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <section className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            className="container hero-content text-center" 
            style={{ paddingTop: '20px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-badge-wrapper">
              <span className="badge badge-indigo">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a855f7', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> AI-POWERED LEARNING PLATFORM
              </span>
            </div>

            <h1 className="hero-title">
              Everything You Need to<br />
              <span className="text-gradient">Master Any Skill</span>
            </h1>

            <p className="hero-subtext">
              Built with precision tools designed to maximize student retention and instructor productivity across every subject and skill level.
            </p>

            <div className="hero-cta-group">
              <button onClick={() => navigate('/signup')} className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Start Learning Free <ArrowRight size={18} />
              </button>
              <a href="#demo" className="btn btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                <Play size={18} /> Watch Demo
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '3rem', marginTop: '4rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>50K+</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Active Learners</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>1,200+</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Expert Courses</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>98%</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Completion Rate</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>4.9★</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Average Rating</div>
              </div>
            </div>
            </motion.div>
        </section>

        <section id="features" className="section-padding translucent-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>Comprehensive Engine</span>
            <h2 className="section-title">Everything You Need to Master Any Skill</h2>
            <p className="section-desc">
              Built with precision tools designed to maximize student retention and instructor productivity.
            </p>
          </motion.div>

          <div className="features-grid">
            {featuresList.map((item, index) => (
              <motion.div 
                key={index} 
                className="glass-card feature-card"
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                viewport={{ once: true }}
              >
                <div className="feature-icon"><item.icon size={22} /></div>
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-desc">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Simple Workflow</span>
            <h2 className="section-title">How EduFlow Works in 4 Steps</h2>
            <p className="section-desc">
              From enrollment to certificate issuance, our streamlined workflow gets you learning immediately.
            </p>
          </motion.div>

          <div className="workflow-grid">
            <motion.div className="glass-card workflow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
              <div className="workflow-step-num">1</div>
              <h3 className="workflow-title">Create Account</h3>
              <p className="workflow-desc">Sign up as a Student or Instructor in seconds with email or 1-click Google Auth.</p>
            </motion.div>

            <motion.div className="glass-card workflow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}>
              <div className="workflow-step-num">2</div>
              <h3 className="workflow-title">Explore Courses</h3>
              <p className="workflow-desc">Browse rich course catalogs, watch preview lectures, and enroll instantly.</p>
            </motion.div>

            <motion.div className="glass-card workflow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
              <div className="workflow-step-num">3</div>
              <h3 className="workflow-title">Learn & Assess</h3>
              <p className="workflow-desc">Watch HD lessons, complete PDF exercises, and test skills via automated quizzes.</p>
            </motion.div>

            <motion.div className="glass-card workflow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}>
              <div className="workflow-step-num">4</div>
              <h3 className="workflow-title">Earn Certificates</h3>
              <p className="workflow-desc">Track real-time progress percentages and download shareable verified credentials.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="about" className="section-padding translucent-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Tailored for Every Learner & Educator</h2>
            <p className="section-desc">
              Select your role to explore how EduFlow supercharges your academic growth.
            </p>
          </motion.div>

          <div className="roles-toggle-group">
            <button
              className={`role-tab-btn ${activeRoleTab === 'student' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('student')}
            >
              <GraduationCap size={18} style={{ display: 'inline', marginRight: '6px' }} /> For Students
            </button>
            <button
              className={`role-tab-btn ${activeRoleTab === 'instructor' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('instructor')}
            >
              <Users size={18} style={{ display: 'inline', marginRight: '6px' }} /> For Instructors
            </button>
          </div>

          <motion.div className="glass-card role-content-box" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '1rem' }}>
                {activeRoleTab === 'student' ? 'Student Capabilities' : 'Instructor Toolkit'}
              </span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                {activeRoleTab === 'student'
                  ? 'Master New Skills with Interactive Learning Tools'
                  : 'Create, Manage, and Monetize Courses Effortlessly'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
                {activeRoleTab === 'student'
                  ? 'Access world-class lectures, submit homework assignments, receive real-time automated quiz feedback, and earn accredited certificates.'
                  : 'Equip yourself with powerful tools to upload videos, generate auto-graded quizzes, manage class rosters, and analyze student engagement.'}
              </p>

              <div className="role-benefits-list">
                {(activeRoleTab === 'student' ? studentBenefits : instructorBenefits).map((benefit, idx) => (
                  <motion.div key={activeRoleTab + idx} className="role-benefit-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.1 }}>
                    <div className="role-benefit-icon">
                      <CheckCircle2 size={16} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="btn btn-primary"
                style={{ marginTop: '2rem' }}
              >
                {activeRoleTab === 'student' ? 'Start Learning Now' : 'Become an Instructor'} <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ background: 'transparent', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gradient-brand)', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeRoleTab === 'student' ? <GraduationCap size={32} color="#fff" /> : <Laptop size={32} color="#fff" />}
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {activeRoleTab === 'student' ? 'Student Portal Portal' : 'Instructor Control Desk'}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {activeRoleTab === 'student'
                  ? 'Over 94% of our active students report higher retention and exam pass rates.'
                  : 'Instructors save an average of 15 hours weekly on administrative auto-grading.'}
              </p>
              <span className="badge badge-emerald">100% Cloud Synchronized</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="analytics" className="section-padding">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>Real-time Intelligence</span>
            <h2 className="section-title">Powerful Analytics & Live Dashboard Preview</h2>
            <p className="section-desc">
              Keep full visibility over course completion stats, quiz scores, and academic velocity.
            </p>
          </motion.div>

          <DashboardPreview />
        </div>
      </section>

      <section className="section-padding translucent-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>Accredited Qualifications</span>
            <h2 className="section-title">Earn Recognized Certificates Upon Completion</h2>
            <p className="section-desc">
              Validate your skills with tamper-proof digital certificates shareable directly to employers.
            </p>
          </motion.div>

          <CertificateCard />
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>User Success Stories</span>
            <h2 className="section-title">Loved by Students & Educators Worldwide</h2>
            <p className="section-desc">
              See what our growing academic community has to say about EduFlow LMS.
            </p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div key={i} className="glass-card testimonial-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                    {[...Array(t.rating)].map((_, r) => (
                      <Star key={r} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p className="testimonial-text">"{t.quote}"</p>
                </div>
                <div className="testimonial-user">
                  <div className="avatar-circle">{t.avatar}</div>
                  <div>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{t.name}</h5>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="cta-banner">
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem' }}>
              Start Learning Today
            </h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
              Build your skills, track your progress, and achieve your career goals with EduFlow LMS.
            </p>
            <button onClick={() => navigate('/signup')} className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
              Get Started Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
