import React, { useState, useEffect } from "react";
import { Course } from "@/entities/Course";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Clock, User as UserIcon, Play, Filter,
  Search, Star, TrendingUp, Award, Download
} from "lucide-react";
import { motion } from "framer-motion";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    document.title = "VirtEnv - Engineering Courses";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, userData] = await Promise.all([
        Course.list("-created_date"),
        User.me().catch(() => null)
      ]);
      setCourses(coursesData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
    setIsLoading(false);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || course.difficulty_level === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const sortedCourses = filteredCourses.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_date) - new Date(a.created_date);
      case "popular":
        return (b.points_reward || 0) - (a.points_reward || 0);
      case "duration":
        return (a.duration_hours || 0) - (b.duration_hours || 0);
      default:
        return 0;
    }
  });

  const categories = [...new Set(courses.map(course => course.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Engineering Courses
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Master the fundamentals and advance your engineering skills with our comprehensive course library
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="duration">Shortest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate" className="hidden lg:flex">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced" className="hidden lg:flex">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <CourseGrid 
                courses={sortedCourses} 
                user={user}
                title="All Courses"
                emptyMessage="No courses match your current filters"
              />
            </TabsContent>

            <TabsContent value="featured" className="mt-6">
              <CourseGrid 
                courses={sortedCourses.filter(course => course.points_reward > 150)} 
                user={user}
                title="Featured Courses"
                emptyMessage="No featured courses available"
              />
            </TabsContent>

            <TabsContent value="beginner" className="mt-6">
              <CourseGrid 
                courses={sortedCourses.filter(course => course.difficulty_level === "Beginner")} 
                user={user}
                title="Beginner Courses"
                emptyMessage="No beginner courses available"
              />
            </TabsContent>

            <TabsContent value="intermediate" className="mt-6">
              <CourseGrid 
                courses={sortedCourses.filter(course => course.difficulty_level === "Intermediate")} 
                user={user}
                title="Intermediate Courses"
                emptyMessage="No intermediate courses available"
              />
            </TabsContent>

            <TabsContent value="advanced" className="mt-6">
              <CourseGrid 
                courses={sortedCourses.filter(course => course.difficulty_level === "Advanced")} 
                user={user}
                title="Advanced Courses"
                emptyMessage="No advanced courses available"
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function CourseGrid({ courses, user, title, emptyMessage }) {
  const getDifficultyColor = (level) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Computer Science": "bg-blue-100 text-blue-800 border-blue-200",
      "Electrical Engineering": "bg-purple-100 text-purple-800 border-purple-200",
      "Mechanical Engineering": "bg-orange-100 text-orange-800 border-orange-200",
      "Civil Engineering": "bg-green-100 text-green-800 border-green-200",
      "Chemical Engineering": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Industrial Engineering": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Aerospace Engineering": "bg-red-100 text-red-800 border-red-200"
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (courses.length === 0) {
    return (
      <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-slate-500">Try adjusting your filters or check back later for new courses.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="h-full shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden group">
            <div className="relative">
              {course.thumbnail_url ? (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className={getDifficultyColor(course.difficulty_level)}>
                  {course.difficulty_level}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={getCategoryColor(course.category)}>
                  {course.category}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_hours}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span>{course.instructor || 'Expert'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{course.points_reward} pts</span>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                {user?.completed_courses?.includes(course.id) && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Award className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={createPageUrl(`Course?id=${course.id}`)} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                      <Play className="w-4 h-4 mr-2" />
                      {user?.completed_courses?.includes(course.id) ? 'Review' : 'Start Learning'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}