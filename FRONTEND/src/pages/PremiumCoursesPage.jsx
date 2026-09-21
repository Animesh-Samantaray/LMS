import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { GraduationCap, PlayCircle, Globe, LayoutGrid, Clock, BookOpen } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Ultimate Job-Ready AI-Powered Data Analytics Course',
    desc: 'This is a to-the-point, CodeWithHarry style AI-Powered Data Analytics...',
    instructor: 'CodeWithHarry',
    level: 'Beginner',
    duration: '36h 22m',
    lessons: 219,
    lang: 'Hindi',
    price: 2599,
    originalPrice: 5198,
    featured: true,
    image: '/courses/course-1.jpg',
  },
  {
    id: 2,
    title: 'The Ultimate Job Ready Data Science Course',
    desc: 'This is a to-the-point, CodeWithHarry style Data Science course! This...',
    instructor: 'CodeWithHarry',
    level: 'Beginner',
    duration: '33h 36m',
    lessons: 203,
    lang: 'Hindi',
    price: 2899,
    originalPrice: 5798,
    featured: true,
    image: '/courses/course-2.jpg',
  },
  {
    id: 3,
    title: '[English] C Programming For Beginners - Learn C Language from Scratch',
    desc: 'This is a beginner friendly C language course with a solid PDF Handboo...',
    instructor: 'CodeWithHarry',
    level: 'Beginner',
    duration: '9h 11m',
    lessons: 64,
    lang: 'English',
    price: 389,
    originalPrice: 778,
    featured: false,
    image: '/courses/course-3.jpg',
  },
  {
    id: 4,
    title: '[English] Ultimate Web Development Course 2026 - Build Modern Websites',
    desc: 'This is the only modern, always up-to-date Web Development course you...',
    instructor: 'CodeWithHarry',
    level: 'Beginner',
    duration: '21h 48m',
    lessons: 146,
    lang: 'English',
    price: 788,
    originalPrice: 1576,
    featured: false,
    image: '/courses/course-4.jpg',
  },
  {
    id: 5,
    title: '[English] Complete 2026 Python Bootcamp: Learn Python from Scratch',
    desc: 'Unlock your potential and become a confident Python developer in 2026!...',
    instructor: 'CodeWithHarry',
    level: 'Beginner',
    duration: '17h 38m',
    lessons: 108,
    lang: 'English',
    price: 388,
    originalPrice: 776,
    featured: false,
    image: '/courses/course-5.jpg',
  },
];

const PremiumCoursesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <img src="/shnoor-logo.png" alt="SHNOOR" className="h-[40px] object-contain" />
            <span className="text-2xl font-extrabold text-[#1f2937] tracking-tight ml-1">LMS</span>
          </Link>
          <button onClick={() => navigate('/login')} className="bg-[#22c55e] text-white px-5 py-2 rounded-md font-bold text-sm hover:bg-[#1ea951] transition-colors">
            Login
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-24 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12 mt-4">Premium Courses</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                {course.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Featured
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-2 line-clamp-2 min-h-[44px]">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-xs line-clamp-2 mb-4 min-h-[32px]">
                  {course.desc}
                </p>
                
                <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-3 border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-1">
                    <LayoutGrid size={12} className="text-yellow-500" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={12} className="text-blue-500" />
                    <span>{course.level}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={12} />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={12} />
                    <span>{course.lang}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-gray-900">₹{course.price}</span>
                    <span className="text-gray-400 text-xs line-through">₹{course.originalPrice}</span>
                    <span className="text-red-500 text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded">50% OFF</span>
                  </div>
                  <button onClick={() => navigate(`/course/${course.id}`)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded text-sm transition-colors">
                    View Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PremiumCoursesPage;
