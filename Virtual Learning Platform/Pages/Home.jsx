import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap, BookOpen, Award, Users, Star,
  Home as HomeIcon, LogIn, Calculator, Cpu, Settings, 
  Code, Wrench, Lightbulb, ArrowRight, TrendingUp, 
  Target, Zap, Brain, Trophy, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [floatingElements, setFloatingElements] = useState([]);

  // Generate floating engineering icons
  useEffect(() => {
    const elements = [];
    const icons = [Calculator, Cpu, Settings, Code, Wrench, Lightbulb, BookOpen, Award];
    
    for (let i = 0; i < 15; i++) {
      elements.push({
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 6,
        size: 16 + Math.random() * 20
      });
    }
    setFloatingElements(elements);
  }, []);

  const heroSlides = [
    {
      title: "Transform Your Engineering Journey",
      subtitle: "Master engineering concepts with India's most comprehensive learning platform",
      description: "Join thousands of engineering students who are advancing their careers through our cutting-edge educational technology. Interactive courses, AI tutoring, and hands-on projects - everything you need to excel.",
      features: ["🎓 500+ Engineering Courses", "🤖 24/7 AI Assistant", "💻 Hands-On Projects", "📜 Industry Certificates"],
      bgGradient: "from-blue-600 via-purple-600 to-indigo-700",
      icon: GraduationCap,
      stats: [
        { number: "15K+", label: "Students" },
        { number: "500+", label: "Courses" },
        { number: "50K+", label: "Certificates" }
      ]
    },
    {
      title: "AI-Powered Learning Experience",
      subtitle: "Get personalized guidance from our advanced AI assistant",
      description: "Experience the future of education with our AI-powered platform that adapts to your learning style. Get instant help, personalized recommendations, and track your progress in real-time.",
      features: ["🧠 Smart AI Tutor", "📊 Progress Analytics", "🎯 Personalized Learning", "⚡ Instant Support"],
      bgGradient: "from-emerald-600 via-teal-600 to-cyan-700",
      icon: Brain,
      stats: [
        { number: "24/7", label: "AI Support" },
        { number: "95%", label: "Success Rate" },
        { number: "1M+", label: "Questions Answered" }
      ]
    },
    {
      title: "Industry-Recognized Certifications",
      subtitle: "Boost your career with verified engineering certificates",
      description: "Earn certificates that are recognized by top engineering companies across India. Showcase your skills and stand out in the competitive job market with our comprehensive certification program.",
      features: ["🏆 Industry Recognition", "💼 Career Advancement", "🔗 LinkedIn Integration", "📋 Skill Verification"],
      bgGradient: "from-orange-600 via-red-600 to-pink-700",
      icon: Trophy,
      stats: [
        { number: "100+", label: "Companies Trust Us" },
        { number: "85%", label: "Get Hired" },
        { number: "12K+", label: "Certificates Issued" }
      ]
    }
  ];

  useEffect(() => {
    document.title = "VirtEnv - Engineering Education Platform";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // If user is authenticated, redirect to dashboard
      if (userData) {
        window.location.href = '/Dashboard';
        return;
      }
    } catch (error) {
      console.log("User not authenticated");
    }

    try {
      const coursesData = await Course.list();
      setCourses(coursesData.slice(0, 6));
    } catch (error) {
      console.error("Error loading courses:", error);
    }

    setIsLoading(false);
  };

  const handleLogin = async () => {
    await User.login();
  };

  const engineeringFields = [
    { name: "Computer Science", icon: Code, color: "bg-blue-500" },
    { name: "Electrical Engineering", icon: Zap, color: "bg-yellow-500" },
    { name: "Mechanical Engineering", icon: Settings, color: "bg-gray-500" },
    { name: "Civil Engineering", icon: HomeIcon, color: "bg-green-500" },
    { name: "Electronics", icon: Cpu, color: "bg-purple-500" },
    { name: "Chemical Engineering", icon: Wrench, color: "bg-orange-500" }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Computer Science Student",
      university: "IIT Delhi",
      content: "VirtEnv's AI assistant helped me understand complex algorithms in minutes. The interactive courses are amazing!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b0e0?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Arjun Kumar",
      role: "Mechanical Engineer",
      university: "NIT Trichy",
      content: "The hands-on projects and industry certificates gave me the confidence to land my dream job at a top MNC.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Sneha Patel",
      role: "Electronics Student",
      university: "BITS Pilani",
      content: "From struggling with circuit design to mastering advanced concepts - VirtEnv transformed my understanding completely.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="engineering-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <g className="stroke-white stroke-1 fill-none">
                <circle cx="25" cy="25" r="10"/>
                <circle cx="75" cy="75" r="8"/>
                <rect x="40" y="40" width="20" height="20" rx="3"/>
                <line x1="35" y1="25" x2="15" y2="25"/>
                <line x1="25" y1="15" x2="25" y2="35"/>
                <line x1="75" y1="67" x2="75" y2="50"/>
                <line x1="67" y1="75" x2="50" y2="75"/>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#engineering-grid)"/>
        </svg>
      </div>

      {/* Floating Engineering Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute text-white/10"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              rotate: [0, 360, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <element.Icon size={element.size} />
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">VirtEnv</h1>
              <p className="text-sm text-blue-200">Engineering Excellence</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Slide 1 - Main Platform */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white space-y-8 mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
              >
                <GraduationCap className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            
            <h2 className="text-7xl font-bold leading-tight">
              {heroSlides[0].title}
            </h2>
            <p className="text-3xl text-blue-200 leading-relaxed max-w-4xl mx-auto">
              {heroSlides[0].subtitle}
            </p>
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              {heroSlides[0].description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
              {heroSlides[0].features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
                >
                  <span className="text-lg font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-12 pt-8">
              {heroSlides[0].stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-green-400">{stat.number}</div>
                  <div className="text-lg text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-8"
            >
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105"
              >
                Start Your Journey Today
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Engineering Fields Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto"
          >
            {engineeringFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex flex-col items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/10"
              >
                <div className={`w-12 h-12 ${field.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <field.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-sm font-medium text-center">{field.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hero Slide 2 - AI Learning */}
      <section className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-emerald-900/30 to-teal-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white space-y-8"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl"
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            
            <h2 className="text-7xl font-bold leading-tight">
              {heroSlides[1].title}
            </h2>
            <p className="text-3xl text-emerald-200 leading-relaxed max-w-4xl mx-auto">
              {heroSlides[1].subtitle}
            </p>
            <p className="text-xl text-emerald-100 leading-relaxed max-w-3xl mx-auto">
              {heroSlides[1].description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
              {heroSlides[1].features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
                >
                  <span className="text-lg font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-12 pt-8">
              {heroSlides[1].stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-emerald-400">{stat.number}</div>
                  <div className="text-lg text-emerald-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105"
              >
                Experience AI Learning
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hero Slide 3 - Certifications */}
      <section className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-orange-900/30 to-pink-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white space-y-8"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            
            <h2 className="text-7xl font-bold leading-tight">
              {heroSlides[2].title}
            </h2>
            <p className="text-3xl text-orange-200 leading-relaxed max-w-4xl mx-auto">
              {heroSlides[2].subtitle}
            </p>
            <p className="text-xl text-orange-100 leading-relaxed max-w-3xl mx-auto">
              {heroSlides[2].description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
              {heroSlides[2].features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
                >
                  <span className="text-lg font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-12 pt-8">
              {heroSlides[2].stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-orange-400">{stat.number}</div>
                  <div className="text-lg text-orange-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105"
              >
                Get Certified Today
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-6">What Students Say</h2>
            <p className="text-xl text-blue-200">Join thousands of successful engineering students</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover shadow-lg"
                      />
                      <div>
                        <h4 className="text-white font-bold">{testimonial.name}</h4>
                        <p className="text-blue-200 text-sm">{testimonial.role}</p>
                        <p className="text-green-400 text-sm">{testimonial.university}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-blue-100 leading-relaxed">{testimonial.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Login/Signup */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </motion.div>
            </div>

            <h2 className="text-6xl font-bold text-white mb-6">
              Ready to Transform Your Engineering Career?
            </h2>
            <p className="text-2xl text-blue-200 leading-relaxed">
              Join India's fastest-growing engineering education platform and unlock your potential with AI-powered learning.
            </p>
            
            <div className="flex flex-col items-center gap-6 pt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-16 py-8 text-2xl rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
                >
                  <LogIn className="w-8 h-8 mr-4" />
                  Sign In / Sign Up Now
                  <ArrowRight className="w-8 h-8 ml-4" />
                </Button>
              </motion.div>

              <p className="text-lg text-blue-300">
                🎉 Free to get started • No credit card required • Start learning in minutes
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-8 border-t border-white/20">
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-semibold">Free to Get Started</span>
              </div>
              <div className="flex items-center gap-3 text-blue-400">
                <Target className="w-6 h-6" />
                <span className="text-lg font-semibold">Learn at Your Pace</span>
              </div>
              <div className="flex items-center gap-3 text-purple-400">
                <Award className="w-6 h-6" />
                <span className="text-lg font-semibold">Industry Recognized</span>
              </div>
              <div className="flex items-center gap-3 text-orange-400">
                <Users className="w-6 h-6" />
                <span className="text-lg font-semibold">15,000+ Students</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}