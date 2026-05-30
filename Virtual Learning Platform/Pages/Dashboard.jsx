import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { Certificate } from "@/entities/Certificate";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TrendingUp, Award, BookOpen, Users, Target, Flame, 
  Clock, ArrowRight, Star, Zap, Trophy, Calendar, MessageSquare,
  Home, Play, CheckCircle, Plus, Sparkles, Brain, Rocket
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalPoints: 0,
    streakDays: 0
  });

  useEffect(() => {
    document.title = "VirtEnv - Dashboard";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, coursesData, certificatesData] = await Promise.all([
        User.me(),
        Course.list("-created_date", 8),
        Certificate.filter({ user_id: (await User.me()).id }).catch(() => [])
      ]);

      setUser(userData);
      setCourses(coursesData);
      setCertificates(certificatesData);
      
      setStats({
        totalCourses: coursesData.length,
        completedCourses: userData.completed_courses?.length || 0,
        totalPoints: userData.points || 0,
        streakDays: userData.streak_days || 0
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-slate-900 dark:to-purple-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-slate-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent>
            <Home className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Please log in to access your dashboard</h2>
            <p className="text-slate-600 mb-6">Your personalized learning dashboard awaits you.</p>
            <Link to={createPageUrl("Home")}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-slate-900 dark:to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Welcome back, {user.full_name?.split(' ')[0]}! 🎓
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-500" />
            Ready to continue your learning journey? Let's make today count!
          </p>
        </motion.div>

        {/* User Profile Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="w-24 h-24 border-4 border-white/30 shadow-2xl">
                    <AvatarImage src={user.profile_picture} />
                    <AvatarFallback className="text-3xl bg-white/20 text-white">
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{user.full_name}</h2>
                  <p className="text-purple-100 mb-4 text-lg">{user.bio || `${user.major || 'Engineering'} Student`}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-medium">{user.major || "Engineering"}</span>
                    </div>
                    {user.university && (
                      <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">{user.university}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Year {user.year_of_study || 1}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Link to={createPageUrl("Profile")}>
                    <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white shadow-lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-blue-100">Total Points</CardTitle>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold mb-1">{stats.totalPoints.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{Math.floor(stats.totalPoints * 0.12)} this month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-green-100">Courses Completed</CardTitle>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold mb-1">{stats.completedCourses}</div>
                <div className="flex items-center gap-2 text-green-100 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>of {stats.totalCourses} available</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-orange-100">Learning Streak</CardTitle>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold mb-1">{stats.streakDays}</div>
                <div className="flex items-center gap-2 text-orange-100 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>days in a row</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-purple-100">Certificates Earned</CardTitle>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold mb-1">{certificates.length}</div>
                <div className="flex items-center gap-2 text-purple-100 text-sm">
                  <Trophy className="w-4 h-4" />
                  <span>achievements unlocked</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Continue Learning Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    Continue Learning
                  </CardTitle>
                  <Link to={createPageUrl("Courses")}>
                    <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Plus className="w-4 h-4 mr-2" />
                      Explore All Courses
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Pick up where you left off or start something new
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-900 border-2 border-slate-200 dark:border-slate-600 hover:shadow-xl transition-all hover:border-purple-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                          {course.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            course.difficulty_level === 'Beginner' ? 'border-green-300 text-green-700 bg-green-50' :
                            course.difficulty_level === 'Intermediate' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                            'border-red-300 text-red-700 bg-red-50'
                          }`}
                        >
                          {course.difficulty_level}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 text-lg">
                        {course.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 bg-white dark:bg-slate-600 px-2 py-1 rounded-md">
                            <Clock className="w-3 h-3" />
                            {course.duration_hours}h
                          </span>
                          <span className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-md">
                            <Star className="w-3 h-3" />
                            {course.points_reward} pts
                          </span>
                        </div>
                        <Link to={createPageUrl(`Course?id=${course.id}`)}>
                          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                            {user.completed_courses?.includes(course.id) ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Review
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {courses.length === 0 && (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <BookOpen className="w-20 h-20 text-purple-300 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-slate-500 mb-4 text-lg">No courses available yet. Check back soon!</p>
                    <Link to={createPageUrl("Courses")}>
                      <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                        <Plus className="w-4 h-4 mr-2" />
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar with Progress & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Learning Progress */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:to-pink-900/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Course Completion</span>
                    <span className="text-purple-600">{Math.round((stats.completedCourses / Math.max(stats.totalCourses, 1)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(stats.completedCourses / Math.max(stats.totalCourses, 1)) * 100} 
                    className="h-3 bg-purple-100"
                  />
                </div>
                
                <div className="space-y-3 pt-4 border-t border-purple-200">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-sm font-medium">Weekly Goal</span>
                    <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">2 courses</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-sm font-medium">Current Level</span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                      {stats.totalPoints < 500 ? 'Beginner' : 
                       stats.totalPoints < 1500 ? 'Intermediate' : 'Expert'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl("AIChat")} className="w-full">
                  <motion.div whileHover={{ x: 5 }} className="w-full">
                    <Button variant="ghost" className="w-full justify-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-700">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      Ask AI Assistant
                    </Button>
                  </motion.div>
                </Link>
                <Link to={createPageUrl("Courses")} className="w-full">
                  <motion.div whileHover={{ x: 5 }} className="w-full">
                    <Button variant="ghost" className="w-full justify-start hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      Browse Courses
                    </Button>
                  </motion.div>
                </Link>
                <Link to={createPageUrl("Certificates")} className="w-full">
                  <motion.div whileHover={{ x: 5 }} className="w-full">
                    <Button variant="ghost" className="w-full justify-start hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:text-yellow-700">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      View Certificates
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.slice(0, 2).map((cert) => (
                      <motion.div 
                        key={cert.id} 
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 border-2 border-yellow-200 dark:border-yellow-800 shadow-md"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-slate-900 dark:text-white">{cert.course_title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Score: {cert.score}%</p>
                        </div>
                      </motion.div>
                    ))}
                    {certificates.length > 2 && (
                      <Link to={createPageUrl("Certificates")}>
                        <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-orange-100">
                          View All {certificates.length} Certificates →
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Award className="w-16 h-16 text-orange-300 mx-auto mb-3" />
                    </motion.div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Complete your first course to earn achievements! 🎯
                    </p>
                    <Link to={createPageUrl("Courses")}>
                      <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}