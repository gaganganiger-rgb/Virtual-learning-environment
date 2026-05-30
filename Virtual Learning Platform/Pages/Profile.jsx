import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { Certificate } from "@/entities/Certificate";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User as UserIcon, Camera, Award, BookOpen, Target,
  Flame, Star, TrendingUp, Edit, Save, X, Upload, Trophy, CreditCard, ClipboardCheck // Added ClipboardCheck icon for quizzes
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    document.title = "VirtEnv - My Profile";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      // Assuming User.me() now returns completed_quizzes as well,
      // and that the User entity also contains these new fields.
      const [coursesData, certificatesData] = await Promise.all([
        Course.list(),
        Certificate.filter({ user_id: userData.id })
      ]);

      setUser(userData);
      setCourses(coursesData);
      setCertificates(certificatesData);
      setEditedUser(userData);
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await User.updateMyUserData(editedUser);
      setUser(editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const updatedData = { ...editedUser, profile_picture: file_url };
      setEditedUser(updatedData);
      await User.updateMyUserData(updatedData);
      setUser(updatedData);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setIsUploading(false);
  };

  const getCompletedCourses = () => {
    return courses.filter(course => user?.completed_courses?.includes(course.id));
  };

  const getCompletedQuizzesCount = () => {
    // Assuming user.completed_quizzes is an array of quiz objects or IDs
    return user?.completed_quizzes?.length || 0;
  };

  const getProgressPercentage = () => {
    if (courses.length === 0) return 0;
    return Math.round((getCompletedCourses().length / courses.length) * 100);
  };

  const getBadges = () => {
    const badges = [];
    const completedCoursesCount = getCompletedCourses().length;
    const completedQuizzesCount = getCompletedQuizzesCount();
    const points = user?.points || 0;
    const streak = user?.streak_days || 0;

    if (completedCoursesCount >= 1) badges.push({ name: "First Steps", icon: "🎯", color: "bg-green-100 text-green-800" });
    if (completedCoursesCount >= 5) badges.push({ name: "Learner", icon: "📚", color: "bg-blue-100 text-blue-800" });
    if (completedCoursesCount >= 10) badges.push({ name: "Scholar", icon: "🎓", color: "bg-purple-100 text-purple-800" });
    if (completedQuizzesCount >= 3) badges.push({ name: "Quiz Master", icon: "📝", color: "bg-orange-100 text-orange-800" });
    if (completedQuizzesCount >= 10) badges.push({ name: "Trivia King/Queen", icon: "🧠", color: "bg-pink-100 text-pink-800" });
    if (points >= 500) badges.push({ name: "Point Collector", icon: "⭐", color: "bg-yellow-100 text-yellow-800" });
    if (points >= 1000) badges.push({ name: "Super Learner", icon: "🚀", color: "bg-red-100 text-red-800" });
    if (streak >= 7) badges.push({ name: "Week Warrior", icon: "🔥", color: "bg-orange-100 text-orange-800" });
    if (streak >= 30) badges.push({ name: "Month Master", icon: "💎", color: "bg-indigo-100 text-indigo-800" });

    return badges;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <UserIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in to view your profile</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Your Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your learning journey and track your progress
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.profile_picture} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <label className="bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">{user.full_name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="outline">{user.major || 'Engineering'}</Badge>
                  <Badge variant="outline">Year {user.year_of_study || 1}</Badge>
                </div>

                {/* Library Card Display */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Library Card</span>
                  </div>
                  {user.library_card_number ? (
                    <Badge className="bg-blue-500 text-white font-mono text-sm px-3 py-1">
                      {user.library_card_number}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-300">
                      Not Assigned
                    </Badge>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Your unique identifier for accessing physical and digital library resources.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{user.points || 0}</p>
                    <p className="text-sm text-slate-500">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{getCompletedCourses().length}</p>
                    <p className="text-sm text-slate-500">Courses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{user.streak_days || 0}</p>
                    <p className="text-sm text-slate-500">Day Streak</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Learning Progress</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
                </div>

                <div className="flex justify-center">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5"> {/* Changed to grid-cols-5 for the new Quizzes tab */}
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger> {/* Added Quizzes Tab */}
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Learning Stats</CardTitle>
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Points</span>
                        <Badge className="bg-blue-500">{user.points || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Courses Completed</span>
                        <Badge className="bg-green-500">{getCompletedCourses().length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Quizzes Completed</span> {/* Added Quizzes Stat */}
                        <Badge className="bg-purple-500">{getCompletedQuizzesCount()}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificates Earned</span>
                        <Badge className="bg-indigo-500">{certificates.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Streak</span>
                        <Badge className="bg-orange-500">{user.streak_days || 0} days</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Library Access</span>
                        <Badge className={user.library_card_number ? "bg-blue-500" : "bg-gray-500"}>
                          {user.library_card_number ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Achievements</CardTitle>
                      <Trophy className="w-6 h-6 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getBadges().slice(0, 4).map((badge, index) => (
                          <Badge key={index} className={badge.color}>
                            {badge.icon} {badge.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {certificates.length > 0 || getCompletedQuizzesCount() > 0 ? ( // Check for quizzes too
                      <div className="space-y-3">
                        {/* Display recent certificates */}
                        {certificates.slice(0, 2).map((cert) => (
                          <div key={cert.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <div className="flex-1">
                              <p className="font-medium">Completed {cert.course_title}</p>
                              <p className="text-sm text-slate-500">Score: {cert.score}% • {new Date(cert.completion_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                        {/* Display recent quizzes (assuming user.completed_quizzes has title, score, date) */}
                        {user.completed_quizzes?.slice(0, 2).map((quiz) => (
                          <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <ClipboardCheck className="w-5 h-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium">Quiz: {quiz.title}</p>
                              <p className="text-sm text-slate-500">Score: {quiz.score}% • {new Date(quiz.completion_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-8">Start learning to see your activity here!</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="mt-6">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>Your Courses</CardTitle>
                    <CardDescription>Track your learning progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getCompletedCourses().length > 0 ? (
                      <div className="grid gap-4">
                        {getCompletedCourses().map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <p className="text-sm text-slate-500">{course.category} • {course.difficulty_level}</p>
                              </div>
                            </div>
                            <Badge className="bg-green-500">Completed</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No completed courses yet. Start learning today!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Quizzes Tab Content */}
              <TabsContent value="quizzes" className="mt-6">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5" />
                      Your Completed Quizzes
                    </CardTitle>
                    <CardDescription>Review your quiz performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getCompletedQuizzesCount() > 0 ? (
                      <div className="grid gap-4">
                        {/* Assuming user.completed_quizzes has objects like { id, title, score, completion_date } */}
                        {user.completed_quizzes.map((quiz) => (
                          <div key={quiz.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                              <ClipboardCheck className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="font-medium">{quiz.title}</p>
                                <p className="text-sm text-slate-500">Score: {quiz.score}% • {new Date(quiz.completion_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Badge className="bg-purple-500">Passed</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No quizzes completed yet. Challenge yourself!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="badges" className="mt-6">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Your Badges
                    </CardTitle>
                    <CardDescription>Achievements you've unlocked</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {getBadges().map((badge, index) => (
                        <div key={index} className={`p-4 rounded-lg ${badge.color} border`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{badge.icon}</span>
                            <div>
                              <p className="font-medium">{badge.name}</p>
                              <p className="text-sm opacity-75">Achievement unlocked!</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {getBadges().length === 0 && (
                      <div className="text-center py-8">
                        <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">Complete courses and activities to earn badges!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={editedUser.full_name || ''}
                              onChange={(e) => setEditedUser({...editedUser, full_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="university">University</Label>
                            <Input
                              id="university"
                              value={editedUser.university || ''}
                              onChange={(e) => setEditedUser({...editedUser, university: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="major">Major</Label>
                            <Select value={editedUser.major || ''} onValueChange={(value) => setEditedUser({...editedUser, major: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select major" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                                <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                                <SelectItem value="Industrial Engineering">Industrial Engineering</SelectItem>
                                <SelectItem value="Aerospace Engineering">Aerospace Engineering</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="year">Year of Study</Label>
                            <Select value={editedUser.year_of_study?.toString() || ''} onValueChange={(value) => setEditedUser({...editedUser, year_of_study: parseInt(value)})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                                <SelectItem value="5">Graduate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={editedUser.bio || ''}
                            onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div><strong>University:</strong> {user.university || 'Not specified'}</div>
                        <div><strong>Major:</strong> {user.major || 'Not specified'}</div>
                        <div><strong>Year:</strong> {user.year_of_study ? `Year ${user.year_of_study}` : 'Not specified'}</div>
                        <div><strong>Bio:</strong> {user.bio || 'No bio provided'}</div>
                        <div className="flex items-center gap-2">
                          <strong>Library Card:</strong>
                          {user.library_card_number ? (
                            <Badge className="bg-blue-500 text-white font-mono">
                              {user.library_card_number}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500">
                              Not assigned - Contact admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
