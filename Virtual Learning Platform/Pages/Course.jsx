import React, { useState, useEffect, useCallback } from "react";
import { Course } from "@/entities/Course";
import { Quiz } from "@/entities/Quiz";
import { QuizAttempt } from "@/entities/QuizAttempt";
import { User } from "@/entities/User";
import { Certificate } from "@/entities/Certificate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, CheckCircle, Clock, User as UserIcon, Award, 
  BookOpen, ArrowLeft, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CoursePage() {
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const loadCourseData = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    try {
      const [courseDataResult] = await Course.filter({ id: courseId });
      
      if (courseDataResult) {
        setCourse(courseDataResult);
        document.title = `VirtEnv - ${courseDataResult.title}`;

        const [allQuizzesData, userData] = await Promise.all([
          Quiz.filter({ course_id: courseId }),
          User.me().catch(() => null)
        ]);
        
        const activeQuiz = allQuizzesData.find(q => q.is_active);
        setQuiz(activeQuiz || null);

        if (userData) {
          setUser(userData);
          if (activeQuiz && userData.completed_courses?.includes(courseId)) {
            setIsQuizCompleted(true);
            const completedQuizRecord = userData.completed_quizzes?.find(q => q.id === activeQuiz.id);
            if (completedQuizRecord) {
              setQuizScore(completedQuizRecord.score);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    }
    setIsLoading(false);
  }, [setCourse, setUser, setQuiz, setIsLoading]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const handleUserAnswer = useCallback((questionIndex, answerIndex) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIndex]: answerIndex
    }));
  }, []);

  const handleQuizSubmit = useCallback(async () => {
    if (!quiz || !user) return;
    
    setIsSubmitting(true);
    try {
      let correctAnswers = 0;
      const answers = [];
      
      quiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        answers.push(userAnswer);
        if (userAnswer === question.correct_answer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / quiz.questions.length) * 100);
      const passed = score >= (quiz.passing_score || 70);
      
      await QuizAttempt.create({
        quiz_id: quiz.id,
        user_id: user.id,
        score: score,
        answers: answers,
        time_taken: null,
        passed: passed
      });
      
      setQuizScore(score);
      setIsQuizCompleted(passed);
      
      if (passed) {
        const updatedCompletedCourses = [...(user.completed_courses || []), course.id];
        const newPoints = (user.points || 0) + (course.points_reward || 100);
        
        let updatedCompletedQuizzes = [...(user.completed_quizzes || [])];
        const existingQuizIndex = updatedCompletedQuizzes.findIndex(q => q.id === quiz.id);
        
        if (existingQuizIndex > -1) {
          if (score > updatedCompletedQuizzes[existingQuizIndex].score) {
            updatedCompletedQuizzes[existingQuizIndex] = {
              id: quiz.id,
              title: quiz.title,
              score: score,
              completion_date: new Date().toISOString()
            };
          }
        } else {
          updatedCompletedQuizzes.push({
            id: quiz.id,
            title: quiz.title,
            score: score,
            completion_date: new Date().toISOString()
          });
        }

        await User.updateMyUserData({ 
          completed_courses: updatedCompletedCourses,
          points: newPoints,
          completed_quizzes: updatedCompletedQuizzes
        });
        
        const existingCerts = await Certificate.filter({ user_id: user.id, course_id: course.id });
        if (existingCerts.length === 0) {
          await Certificate.create({
            user_id: user.id,
            course_id: course.id,
            certificate_id: `CERT-${user.id.slice(0, 4)}-${course.id.slice(0, 4)}-${Date.now()}`,
            user_name: user.full_name,
            course_title: course.title,
            completion_date: new Date().toISOString().split('T')[0],
            score: score,
          });
        }
        
        setUser({ 
          ...user, 
          completed_courses: updatedCompletedCourses,
          points: newPoints,
          completed_quizzes: updatedCompletedQuizzes
        });
      } else {
        setUserAnswers({});
      }
      
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
    setIsSubmitting(false);
  }, [quiz, user, userAnswers, course, setUser, setIsQuizCompleted, setQuizScore, setUserAnswers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Course not found</h2>
            <Link to={createPageUrl("Courses")}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = user?.completed_courses?.includes(course.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Courses")}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Badge className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              <Badge variant="outline">{course.category}</Badge>
              <Badge variant="outline">{course.difficulty_level}</Badge>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{course.title}</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_hours} hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span>{course.instructor || 'Expert Instructor'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{course.points_reward} points</span>
                </div>
              </div>
            </div>
            
            <div>
              <Card className="shadow-xl border-0">
                <CardContent className="p-6">
                  {course.thumbnail_url && (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{isCompleted ? '100%' : '0%'}</span>
                    </div>
                    <Progress value={isCompleted ? 100 : 0} className="h-2" />
                    <div className="text-sm text-slate-500">
                      {quiz ? '1 quiz available' : 'No quizzes available'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Course Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quiz" disabled={!quiz}>
                Quiz {quiz ? '(1)' : '(0)'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6">
                {/* Video Section */}
                {course.video_url && (
                  <Card className="shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-blue-500" />
                        Course Video
                      </CardTitle>
                      <CardDescription>
                        Learn from expert instruction in {course.video_language}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={course.video_url.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Course Details */}
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent className="prose dark:prose-invert max-w-none">
                    <p>{course.description}</p>
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-semibold mb-2">Course Details</h4>
                        <ul className="space-y-2 text-sm">
                          <li><strong>Category:</strong> {course.category}</li>
                          <li><strong>Level:</strong> {course.difficulty_level}</li>
                          <li><strong>Duration:</strong> {course.duration_hours} hours</li>
                          <li><strong>Points:</strong> {course.points_reward}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Assessment</h4>
                        <ul className="space-y-2 text-sm">
                          <li><strong>Quizzes:</strong> {quiz ? '1 available' : 'None available'}</li>
                          <li><strong>Completion:</strong> Pass the course quiz</li>
                          <li><strong>Certificate:</strong> Available upon completion</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Quiz Tab */}
            <TabsContent value="quiz" className="mt-6">
              <AnimatePresence mode="wait">
                {!quiz ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center py-10">
                    <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Quizzes Available</h2>
                    <p className="text-slate-600 dark:text-slate-400">There are no quizzes associated with this course yet. Check back later!</p>
                  </motion.div>
                ) : quizScore !== null ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="shadow-xl border-0">
                      <CardHeader className={`text-center ${isQuizCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <CardTitle className={`text-2xl ${isQuizCompleted ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {isQuizCompleted ? 'Quiz Passed! 🎉' : 'Quiz Failed 😔'}
                        </CardTitle>
                        <CardDescription>
                          Your Score: {quizScore}% ({Math.round((quizScore / 100) * quiz.questions.length)}/{quiz.questions.length} correct)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <Progress value={quizScore} className="h-3" />
                          <p className="text-slate-600 dark:text-slate-400">
                            {isQuizCompleted 
                              ? `Congratulations! You've successfully completed this quiz with ${quizScore}%.`
                              : `You need ${quiz.passing_score || 70}% to pass. Review the material and try again.`
                            }
                          </p>
                          
                          <div className="flex justify-center gap-4">
                            <Button 
                              variant="outline" 
                              onClick={() => { 
                                setUserAnswers({}); 
                                setQuizScore(null); 
                                setIsQuizCompleted(false);
                              }}
                            >
                              {isQuizCompleted ? 'Review Quiz' : 'Retry Quiz'}
                            </Button>
                            {isQuizCompleted && !isCompleted && (
                              <Button onClick={() => setActiveTab("overview")} className="bg-green-600 hover:bg-green-700">
                                <Award className="w-4 h-4 mr-2" />
                                Course Completed!
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="shadow-xl border-0">
                      <CardHeader>
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>
                          Answer all questions to complete the quiz. You need {quiz.passing_score || 70}% to pass.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {quiz.questions?.map((question, qIndex) => (
                          <div key={qIndex} className="space-y-4">
                            <h3 className="text-lg font-semibold">
                              Question {qIndex + 1}: {question.question}
                            </h3>
                            <div className="space-y-2">
                              {question.options?.map((option, oIndex) => (
                                <label key={oIndex} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                  <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    checked={userAnswers[qIndex] === oIndex}
                                    onChange={() => handleUserAnswer(qIndex, oIndex)}
                                    className="text-blue-600"
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex justify-between pt-6">
                          <Button variant="outline" onClick={() => { setActiveTab("overview"); setUserAnswers({}); }}>
                            Back to Overview
                          </Button>
                          <Button 
                            onClick={handleQuizSubmit}
                            disabled={isSubmitting || Object.keys(userAnswers).length < quiz.questions?.length}
                          >
                            {isSubmitting ? "Submitting..." : "Submit Quiz"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}