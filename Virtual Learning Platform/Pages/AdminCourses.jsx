
import React, { useState, useEffect, useCallback } from "react";
import { Course } from "@/entities/Course";
import { Quiz } from "@/entities/Quiz";
import { User } from "@/entities/User";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Plus, Edit, Trash2, Play, Download,
  Clock, Star, Users, Search, Eye, HelpCircle, X
} from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function AdminCoursesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [coursesData, quizzesData] = await Promise.all([
        Course.list("-created_date"),
        Quiz.list("-created_date")
      ]);
      setCourses(coursesData);
      setQuizzes(quizzesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin' && !user.is_admin) {
        window.location.href = createPageUrl("Home");
        return;
      }
      setCurrentUser(user);
      await loadData();
    } catch (error) {
      window.location.href = createPageUrl("Home");
    }
    setIsLoading(false);
  }, [loadData]);

  const filterCourses = useCallback(() => {
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (selectedCourse) {
        await Course.update(selectedCourse.id, courseData);
      } else {
        await Course.create(courseData);
      }
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      setSelectedCourse(null);
      await loadData();
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await Course.delete(courseId);
        await loadData();
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleManageQuizzes = (course) => {
    setSelectedCourse(course);
    setIsQuizDialogOpen(true);
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setIsCreateQuizOpen(true);
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsCreateQuizOpen(true);
  };

  const handleSaveQuiz = async (quizData) => {
    try {
      const quizWithCourse = { ...quizData, course_id: selectedCourse.id };
      if (selectedQuiz) {
        await Quiz.update(selectedQuiz.id, quizWithCourse);
      } else {
        await Quiz.create(quizWithCourse);
      }
      setIsCreateQuizOpen(false);
      setSelectedQuiz(null);
      await loadData();
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await Quiz.delete(quizId);
        await loadData();
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const getCourseQuizzes = (courseId) => {
    return quizzes.filter(quiz => quiz.course_id === courseId);
  };

  const getDifficultyBadge = (level) => {
    const colors = {
      Beginner: "bg-green-600",
      Intermediate: "bg-yellow-600",
      Advanced: "bg-red-600"
    };
    return <Badge className={colors[level]}>{level}</Badge>;
  };

  const getCategoryBadge = (category) => {
    return <Badge variant="outline" className="text-slate-300 border-slate-600">{category}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Course Management</h1>
          <p className="text-slate-400">Create and manage educational content with integrated quizzes</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-green-600 text-white px-4 py-2">
            <BookOpen className="w-4 h-4 mr-2" />
            {courses.length} Total Courses
          </Badge>
          <Button
            onClick={handleCreateCourse}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by title, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Courses ({filteredCourses.length})</CardTitle>
          <CardDescription className="text-slate-400">
            Showing {filteredCourses.length} of {courses.length} courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Course</TableHead>
                <TableHead className="text-slate-300">Category</TableHead>
                <TableHead className="text-slate-300">Difficulty</TableHead>
                <TableHead className="text-slate-300">Duration</TableHead>
                <TableHead className="text-slate-300">Quizzes</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{course.title}</p>
                      <p className="text-sm text-slate-400 line-clamp-1">
                        {course.description}
                      </p>
                      {course.instructor && (
                        <p className="text-xs text-slate-500">
                          Instructor: {course.instructor}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(course.category)}</TableCell>
                  <TableCell>{getDifficultyBadge(course.difficulty_level)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours || 0}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600">
                        {getCourseQuizzes(course.id).length} Quizzes
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageQuizzes(course)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <HelpCircle className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = createPageUrl(`Course?id=${course.id}`)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No courses found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Dialogs */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <CourseForm
            course={null}
            onSave={handleSaveCourse}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course: {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <CourseForm
              course={selectedCourse}
              onSave={handleSaveCourse}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Management Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage Quizzes - {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          <QuizManagement 
            course={selectedCourse}
            quizzes={getCourseQuizzes(selectedCourse?.id)}
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        </DialogContent>
      </Dialog>

      {/* Create/Edit Quiz Dialog */}
      <Dialog open={isCreateQuizOpen} onOpenChange={setIsCreateQuizOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuiz ? `Edit Quiz: ${selectedQuiz.title}` : `Create Quiz for ${selectedCourse?.title}`}
            </DialogTitle>
          </DialogHeader>
          <QuizForm
            quiz={selectedQuiz}
            onSave={handleSaveQuiz}
            onCancel={() => setIsCreateQuizOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Quiz Management Component
function QuizManagement({ course, quizzes, onCreateQuiz, onEditQuiz, onDeleteQuiz }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Course Quizzes ({quizzes.length})
        </h3>
        <Button onClick={onCreateQuiz} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {quizzes.length > 0 ? (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-white">{quiz.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                  <span>{quiz.questions?.length || 0} questions</span>
                  <span>{quiz.passing_score || 70}% passing score</span>
                  <span>{quiz.time_limit ? `${quiz.time_limit} min` : 'No time limit'}</span>
                  <Badge className={quiz.is_active ? "bg-green-600" : "bg-red-600"}>
                    {quiz.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditQuiz(quiz)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteQuiz(quiz.id)}
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <p>No quizzes created for this course yet.</p>
          <p className="text-sm">Create your first quiz to help students test their knowledge.</p>
        </div>
      )}
    </div>
  );
}

// Course Form Component
function CourseForm({ course, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    difficulty_level: course?.difficulty_level || 'Beginner',
    duration_hours: course?.duration_hours || 1,
    video_url: course?.video_url || '',
    video_language: course?.video_language || 'English',
    // notes_url was removed as per outline
    thumbnail_url: course?.thumbnail_url || '',
    instructor: course?.instructor || '',
    points_reward: course?.points_reward || 100,
    is_active: course?.is_active !== undefined ? course.is_active : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-slate-300">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="instructor" className="text-slate-300">Instructor</Label>
          <Input
            id="instructor"
            value={formData.instructor}
            onChange={(e) => setFormData({...formData, instructor: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-slate-300">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category" className="text-slate-300">Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({...formData, category: value})}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
              <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
              <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
              <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty_level" className="text-slate-300">Difficulty</Label>
          <Select 
            value={formData.difficulty_level} 
            onValueChange={(value) => setFormData({...formData, difficulty_level: value})}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration_hours" className="text-slate-300">Duration (hours)</Label>
          <Input
            id="duration_hours"
            type="number"
            min="1"
            value={formData.duration_hours}
            onChange={(e) => setFormData({...formData, duration_hours: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="video_url" className="text-slate-300">Video URL</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="YouTube or Vimeo URL"
          />
        </div>

        <div>
          <Label htmlFor="video_language" className="text-slate-300">Video Language</Label>
          <Select 
            value={formData.video_language} 
            onValueChange={(value) => setFormData({...formData, video_language: value})}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="thumbnail_url" className="text-slate-300">Thumbnail URL</Label>
          <Input
            id="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Course thumbnail image"
          />
        </div>

        <div>
          <Label htmlFor="points_reward" className="text-slate-300">Points Reward</Label>
          <Input
            id="points_reward"
            type="number"
            min="0"
            value={formData.points_reward}
            onChange={(e) => setFormData({...formData, points_reward: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          className="rounded"
        />
        <Label htmlFor="is_active" className="text-slate-300">
          Course Active
        </Label>
      </div>


      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}

// Quiz Form Component
function QuizForm({ quiz, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    questions: quiz?.questions || [
      {
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: ''
      }
    ],
    passing_score: quiz?.passing_score || 70,
    time_limit: quiz?.time_limit || null,
    is_active: quiz?.is_active !== undefined ? quiz.is_active : true
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          explanation: ''
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title" className="text-slate-300">Quiz Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="passing_score" className="text-slate-300">Passing Score (%)</Label>
          <Input
            id="passing_score"
            type="number"
            min="0"
            max="100"
            value={formData.passing_score}
            onChange={(e) => setFormData({...formData, passing_score: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="time_limit" className="text-slate-300">Time Limit (minutes)</Label>
          <Input
            id="time_limit"
            type="number"
            min="1"
            value={formData.time_limit || ''}
            onChange={(e) => setFormData({...formData, time_limit: e.target.value ? parseInt(e.target.value) : null})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="No limit"
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            className="rounded"
          />
          <Label htmlFor="is_active" className="text-slate-300">
            Quiz Active
          </Label>
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Questions</h3>
          <Button type="button" onClick={addQuestion} variant="outline" className="border-slate-600 text-slate-300">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="space-y-6">
          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-white">Question {qIndex + 1}</h4>
                {formData.questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-slate-300">Question Text *</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Enter your question..."
                    required
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Answer Options</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2 mt-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correct_answer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                        className="text-green-600"
                      />
                      <Input
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white"
                        placeholder={`Option ${oIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Label className="text-slate-300">Explanation (Optional)</Label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Explain why this is the correct answer..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {quiz ? 'Update Quiz' : 'Create Quiz'}
        </Button>
      </div>
    </form>
  );
}
