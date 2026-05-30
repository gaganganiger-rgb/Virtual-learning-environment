import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { Quiz } from "@/entities/Quiz";
import { QuizAttempt } from "@/entities/QuizAttempt";
import { Certificate } from "@/entities/Certificate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users, BookOpen, HelpCircle, Award, TrendingUp,
  UserCheck, GraduationCap, Target, Shield, AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalCertificates: 0,
    activeUsers: 0,
    completedCourses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize loadAdminData to ensure it's a stable function reference
  const loadAdminData = useCallback(async () => {
    try {
      const [users, courses, quizzes, certificates, quizAttempts] = await Promise.all([
        User.list(),
        Course.list(),
        Quiz.list(),
        Certificate.list(),
        QuizAttempt.list("-created_date", 10)
      ]);

      setStats({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        totalCertificates: certificates.length,
        activeUsers: users.filter(u => {
          const lastActivity = new Date(u.last_activity);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastActivity > weekAgo;
        }).length,
        completedCourses: quizAttempts.filter(a => a.passed).length
      });

      // Recent activity for admin dashboard
      const activity = quizAttempts.map(attempt => ({
        type: 'quiz_completed',
        user_id: attempt.user_id,
        details: `Score: ${attempt.score}%`,
        timestamp: attempt.created_date
      }));

      setRecentActivity(activity);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  }, []); // Dependencies: setStats and setRecentActivity are stable dispatch functions, other dependencies are stable static methods.

  // Memoize checkAdminAccess to ensure it's a stable function reference
  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();

      // Strict admin access control
      if (user.role !== 'admin' && !user.is_admin) {
        window.location.href = createPageUrl("Home");
        return;
      }

      setCurrentUser(user);
      await loadAdminData(); // Depends on loadAdminData
    } catch (error) {
      console.error("Access denied:", error);
      window.location.href = createPageUrl("Home");
    }
    setIsLoading(false);
  }, [loadAdminData]); // Dependencies: loadAdminData (now memoized).

  useEffect(() => {
    document.title = "VirtEnv - Admin Dashboard";
    checkAdminAccess();
  }, [checkAdminAccess]); // Depend on the memoized checkAdminAccess function

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">
              Welcome back, {currentUser.full_name}. Here's what's happening with your platform.
            </p>
          </div>
          <Badge className="bg-red-600 text-white px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Administrator
          </Badge>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-slate-400">
                {stats.activeUsers} active this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
              <p className="text-xs text-slate-400">
                {stats.completedCourses} completions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Quizzes</CardTitle>
              <HelpCircle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalQuizzes}</div>
              <p className="text-xs text-slate-400">
                Assessment system active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Certificates Issued</CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCertificates}</div>
              <p className="text-xs text-slate-400">
                Student achievements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="overview" className="text-slate-300">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-slate-300">Users</TabsTrigger>
            <TabsTrigger value="courses" className="text-slate-300">Courses</TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-slate-300 text-sm">Quiz completed</p>
                        <p className="text-slate-400 text-xs">{activity.details}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.location.href = createPageUrl("AdminUsers")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => window.location.href = createPageUrl("AdminCourses")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Manage Courses
                  </Button>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.location.href = createPageUrl("AdminSettings")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Advanced user management features coming soon
                  </p>
                  <Button
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.location.href = createPageUrl("AdminUsers")}
                  >
                    Go to User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Course Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Create and manage educational content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Course creation and editing tools
                  </p>
                  <Button
                    className="mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => window.location.href = createPageUrl("AdminCourses")}
                  >
                    Go to Course Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Analytics</CardTitle>
                <CardDescription className="text-slate-400">
                  Track performance and user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <UserCheck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                    <p className="text-sm text-slate-400">Active Users</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <GraduationCap className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
                    <p className="text-sm text-slate-400">Course Completions</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stats.totalCertificates}</p>
                    <p className="text-sm text-slate-400">Certificates Issued</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}