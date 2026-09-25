import React, { useState } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { Check, ChevronDown, ChevronUp, PlayCircle, MonitorPlay, FileText, Award, Share2 } from 'lucide-react';

const commonFaqs = [
  { q: "How do I log in and access my course?", a: "Once you complete your purchase, you can log in using the email and password you used during checkout. After logging in, go to your Student Dashboard to access all your enrolled courses." },
  { q: "Why are my course videos not playing, or showing errors?", a: "This is usually caused by network issues or outdated browser cache. Please try refreshing the page, clearing your cache, or switching to a different internet connection. If the issue persists, contact our support team." },
  { q: "How can I download my certificate?", a: "After you complete 100% of the course lectures and assignments, a 'Download Certificate' button will appear on your course dashboard. You can download it as a PDF." },
  { q: "Can I change the name on my certificate?", a: "Yes. Before downloading your certificate, you can update your display name in your Profile Settings, and the updated name will reflect on your certificate." },
  { q: "Where can I find the course handbook?", a: "The course handbook and any associated PDF resources can be found in the very first introductory section of the course content under 'Resources'." },
  { q: "Why is there a watermark on the video?", a: "We apply a dynamic watermark containing your user ID to prevent unauthorized distribution and piracy of our premium content." },
  { q: "Can I download the course videos?", a: "No, course videos are strictly for online streaming on our platform to prevent piracy. However, you have 2 years of access to watch them anytime." },
  { q: "What is the refund policy?", a: "We offer a 7-day money-back guarantee if you are not satisfied with the course, provided you have watched less than 10% of the content. Contact support to initiate a refund." },
];

const courseDatabase = {
  "1": {
    title: "Ultimate Job-Ready AI-Powered Data Analytics Course",
    price: 2599,
    originalPrice: 5198,
    lectures: 219,
    duration: "36hr 22min",
    sectionsCount: 12,
    description: "This is a to-the-point, CodeWithHarry style AI-Powered Data Analytics course! This all-in-one Ultimate Job-Ready AI-Powered Data Analytics Course is designed for beginners and intermediate learners who want to master modern data analytics, leverage AI tools, and become industry-ready with hands-on practical projects.",
    learn: [
      "Understand the complete Data Analytics workflow from data collection to insight generation",
      "Query, manage, and transform databases with SQL like a professional analyst",
      "Work with Excel for advanced reporting, automation, and analysis",
      "Analyze and clean real-world datasets using Python, Pandas, and NumPy",
      "Leverage AI-powered tools to automate analysis, generate insights, and boost productivity",
      "Build dashboards and interactive reports using Power BI",
    ],
    requirements: [
      "No prior experience in data analytics is needed",
      "Basic computer skills and internet access",
      "Willingness to learn and solve real-world problems",
      "Curiosity and consistency; that's all you really need!",
      "Stable internet connection for accessing course content",
      "Basic familiarity with using the terminal/command line (helpful but not required)",
    ],
    content: [
      { title: "Introduction to Data Analytics", lectures: 6, time: "42min" },
      { title: "Basic Excel for Data Analytics", lectures: 23, time: "288min" },
      { title: "Basic Python (AI-powered)", lectures: 30, time: "342min" },
      { title: "SQL for Data Analytics", lectures: 30, time: "262min" },
      { title: "Advanced Python", lectures: 13, time: "171min" },
      { title: "AI Tools for Data Analysts - Make Coders Jealous", lectures: 6, time: "80min" },
      { title: "Advanced Excel for Data Analytics", lectures: 44, time: "339min" },
      { title: "Git & GitHub for Data Analysts", lectures: 11, time: "120min" },
      { title: "Web Development for Data Analysts (UI, Dashboards)", lectures: 8, time: "160min" },
      { title: "Probability & Statistics for Data Analytics", lectures: 15, time: "133min" },
      { title: "Data Visualization using Power BI", lectures: 23, time: "179min" },
      { title: "Tableau for Data Analytics", lectures: 10, time: "62min" },
    ],
    image: "/courses/course-1.jpg"
  },
  "2": {
    title: "The Ultimate Job Ready Data Science Course",
    price: 2899,
    originalPrice: 5798,
    lectures: 203,
    duration: "33hr 35min",
    sectionsCount: 24,
    description: "This is a to-the-point, CodeWithHarry style Data Science course! This course is designed to take you from a complete beginner to a job-ready Data Scientist. You will master Python, Pandas, NumPy, Matplotlib, Seaborn, Machine Learning, Deep Learning, and much more.",
    learn: [
      "Master Python programming from a data science perspective",
      "Create stunning data visualizations with Matplotlib and Seaborn",
      "Clean and preprocess real-world datasets for accurate insights",
      "Use Jupyter Notebooks for data-driven development",
      "Perform powerful data analysis using Pandas and NumPy",
      "Understand and apply core statistics and probability concepts",
      "Work on real-life projects",
      "Many Developer Tools like Quadratic AI",
    ],
    requirements: [
      "A computer (Windows, macOS, or Linux) with internet access",
      "No prior coding experience required - this course starts from scratch",
      "Willingness to learn and practice coding consistently",
    ],
    content: [
      { title: "Introduction to Data Science", lectures: 4, time: "28min" },
      { title: "Understanding the Conda Environment", lectures: 6, time: "37min" },
      { title: "Python Refresher (For Data Science)", lectures: 19, time: "137min" },
      { title: "Claim your Free Developer Tools", lectures: 2, time: "6min" },
      { title: "Project 1 - Coders of Delhi", lectures: 4, time: "59min" },
      { title: "Project 2 - Coders of Bangalore", lectures: 6, time: "61min" },
      { title: "Data Analysis using Numpy", lectures: 7, time: "87min" },
      { title: "Data Analysis using Pandas", lectures: 10, time: "127min" },
      { title: "Data Visualization using Matplotlib and Seaborn", lectures: 10, time: "137min" },
      { title: "Data Collection Techniques", lectures: 5, time: "67min" },
    ],
    image: "/courses/course-2.jpg"
  },
  "3": {
    title: "[English] C Programming For Beginners - Learn C Language from Scratch",
    price: 389,
    originalPrice: 778,
    lectures: 64,
    duration: "9hr 11min",
    sectionsCount: 12,
    description: "This is a beginner friendly C language course with a solid PDF Handbook and thorough explanations for absolute beginners.",
    learn: [
      "Master C Language and build a solid programming foundation",
      "Learn what programming is and why we use C Language",
      "Learn how logic building is done as a complete beginner",
      "Revise concepts from the PDF Handbook authored by top coding mentor in the industry",
    ],
    requirements: [
      "A computer (Windows, macOS, or Linux) with internet access",
      "No prior coding experience required - this course starts from scratch",
      "Willingness to learn and practice coding consistently",
    ],
    content: [
      { title: "Introduction to Programming", lectures: 9, time: "56min" },
      { title: "Basics of C Programming", lectures: 6, time: "67min" },
      { title: "Operators and Expressions", lectures: 7, time: "79min" },
      { title: "Conditional Statements and Control Flow", lectures: 5, time: "56min" },
      { title: "Loops", lectures: 6, time: "54min" },
      { title: "Functions in C", lectures: 5, time: "51min" },
      { title: "Arrays", lectures: 4, time: "32min" },
      { title: "Strings", lectures: 4, time: "24min" },
      { title: "Pointers", lectures: 5, time: "40min" },
      { title: "Dynamic Memory", lectures: 3, time: "27min" },
    ],
    image: "/courses/course-3.jpg"
  },
  "4": {
    title: "[English] Ultimate Web Development Course 2026 - Build Modern Websites",
    price: 788,
    originalPrice: 1576,
    lectures: 146,
    duration: "21hr 48min",
    sectionsCount: 18,
    description: "This is the only modern, always up-to-date Web Development course you need. Learn HTML, CSS, JavaScript, Node.js, Express, MongoDB, and React to build responsive and robust websites.",
    learn: [
      "Understand how websites work and how you can build them from scratch",
      "Find the best tool to build your websites in modern era",
      "Understand how to use AI to accelerate your development",
      "Build projects along the side and get the best learning experience!",
    ],
    requirements: [
      "A computer (Windows, macOS, or Linux) with internet access",
      "No prior coding experience required - this course starts from scratch",
      "Willingness to learn and practice coding consistently",
    ],
    content: [
      { title: "Introduction to Web Development", lectures: 4, time: "11min" },
      { title: "HTML Basics", lectures: 9, time: "77min" },
      { title: "Advanced HTML", lectures: 8, time: "49min" },
      { title: "Project 1 - Distraction Free YouTube", lectures: 4, time: "22min" },
      { title: "Introduction to CSS", lectures: 10, time: "114min" },
      { title: "Advanced CSS", lectures: 6, time: "73min" },
      { title: "Project 2 - Personal Portfolio Website using HTML & CSS", lectures: 8, time: "82min" },
      { title: "Introduction to JavaScript", lectures: 14, time: "154min" },
      { title: "DOM Manipulation", lectures: 7, time: "36min" },
      { title: "Advanced DOM Manipulation", lectures: 3, time: "38min" },
    ],
    image: "/courses/course-4.jpg"
  },
  "5": {
    title: "[English] Complete 2026 Python Bootcamp: Learn Python from Scratch",
    price: 388,
    originalPrice: 776,
    lectures: 108,
    duration: "17hr 36min",
    sectionsCount: 16,
    description: "Unlock your potential and become a confident Python developer in 2026! This beginner-friendly bootcamp takes you from zero to hero with step-by-step guidance, real-world projects, and hands-on coding exercises. Whether you're a student, aspiring developer, or career switcher, this course will equip you with the skills employers demand.",
    learn: [
      "Master Python Basics: Learn Python programming fundamentals, including variables, data types, loops, and conditionals.",
      "Automate Tasks with Python: Use Python to simplify repetitive tasks, including file handling and web scraping.",
      "Understand Object-Oriented Programming (OOP): Learn how to design classes, objects, and implement inheritance in Python.",
      "Build Projects from Scratch: Develop practical Python projects, such as calculators, games, and automation scripts.",
      "Work with Real-World Data: Gain hands-on experience using Python libraries like Requests and Shutil.",
    ],
    requirements: [
      "No prior programming experience needed - this course is beginner-friendly",
      "Willingness to learn and practice",
      "Basic English reading/listening skills (since the course is in English)",
    ],
    content: [
      { title: "Introduction to Programming & Python", lectures: 4, time: "24min" },
      { title: "Python Fundamentals", lectures: 6, time: "77min" },
      { title: "Control Flow and Loops", lectures: 6, time: "62min" },
      { title: "Strings", lectures: 5, time: "55min" },
      { title: "Functions and Modules", lectures: 7, time: "76min" },
      { title: "Data Structures in Python", lectures: 6, time: "56min" },
      { title: "Object-Oriented Programming (OOP) in Python", lectures: 7, time: "41min" },
      { title: "Advanced Python Concepts", lectures: 9, time: "125min" },
      { title: "File IO - Working with Files & Related Modules", lectures: 5, time: "51min" },
      { title: "Working with External Libraries", lectures: 4, time: "41min" },
    ],
    image: "/courses/course-5.jpg"
  }
};

const PremiumCourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const course = courseDatabase[id];

  if (!course) {
    return <Navigate to="/premium-courses" />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      <main className="flex-1 container mx-auto px-4 py-24 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1">
            
            <section className="mb-12 border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learn.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-gray-700 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            
            <section className="mb-12">
              <div className="flex items-end justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Course content</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Expand all sections</button>
              </div>
              <p className="text-sm text-gray-500 mb-6">{course.sectionsCount} sections • {course.lectures} lectures • {course.duration}</p>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                {course.content.map((section, i) => (
                  <div key={i} className="flex flex-col">
                    <div 
                      onClick={() => toggleSection(i)}
                      className="bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        {openSection === i ? (
                          <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-800 text-sm">{section.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{section.lectures} lectures • {section.time}</span>
                    </div>
                    {openSection === i && (
                      <div className="bg-white p-4 border-t border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600 pl-7">
                          <PlayCircle size={14} className="text-gray-400" />
                          <span>Introduction & Overview</span>
                          <span className="ml-auto text-gray-400">02:15</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 pl-7">
                          <FileText size={14} className="text-gray-400" />
                          <span className="underline decoration-gray-300 underline-offset-2">Downloadable Resources</span>
                          <span className="ml-auto text-gray-400">1 file</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 pl-7">
                          <PlayCircle size={14} className="text-gray-400" />
                          <span>Deep Dive</span>
                          <span className="ml-auto text-gray-400">12:30</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            
            <section className="mb-12 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-3 text-sm text-gray-700">
                {course.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </section>

            
            <section className="mb-12 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </section>

            
            <section className="mb-12 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="divide-y divide-gray-100">
                {commonFaqs.map((faq, i) => (
                  <div key={i} className="py-4 cursor-pointer group" onClick={() => toggleFaq(i)}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium transition-colors ${openFaq === i ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`}>
                        {faq.q}
                      </span>
                      {openFaq === i ? (
                        <ChevronUp size={16} className="text-blue-600" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                    {openFaq === i && (
                      <div className="mt-3 text-sm text-gray-600 leading-relaxed pr-8">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          
          <div className="w-full lg:w-[380px] flex-shrink-0 relative">
            <div className="sticky top-24 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
              
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center cursor-pointer group">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <PlayCircle size={32} className="text-white" fill="white" />
                  </div>
                </div>
              </div>

              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">₹{course.price}</span>
                  <span className="text-lg text-gray-400 line-through">₹{course.originalPrice}</span>
                  <span className="text-red-500 text-sm font-bold bg-red-50 px-2 py-1 rounded">50% OFF</span>
                </div>
                
                <button onClick={() => navigate('/login')} className="w-full bg-[#1e2336] hover:bg-gray-900 text-white font-bold py-3.5 rounded-lg mb-3 transition-colors text-[15px]">
                  Click here to Login and Buy
                </button>
                <p className="text-center text-xs text-gray-500 mb-8">Login to purchase this course</p>

                <h4 className="font-bold text-gray-900 mb-4 text-sm">This course includes:</h4>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-3"><MonitorPlay size={16} className="text-gray-400" /> {course.lectures} lectures</li>
                  <li className="flex items-center gap-3"><PlayCircle size={16} className="text-gray-400" /> {course.duration}</li>
                  <li className="flex items-center gap-3"><MonitorPlay size={16} className="text-gray-400" /> Access on mobile and desktop (2 Years)</li>
                  <li className="flex items-center gap-3"><Award size={16} className="text-gray-400" /> Certificate of completion</li>
                </ul>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PremiumCourseDetailsPage;
