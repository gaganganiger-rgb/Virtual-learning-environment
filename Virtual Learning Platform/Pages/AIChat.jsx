
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { ChatMessage } from "@/entities/ChatMessage";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Send, Loader2, Zap, BookOpen, Calculator, Lightbulb, User as UserIcon, Sparkles, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChatPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const suggestedPrompts = [
    "What is Ohm's law?",
    "How to calculate stress in materials?",
    "Explain Newton's second law",
    "What is the difference between AC and DC?",
    "How does a transistor work?"
  ];

  const loadMessages = useCallback(async () => {
    if (!user) return;
    try {
      const aiMessages = await ChatMessage.filter({ 
        is_ai_message: true, 
        "$or": [{ sender_id: user.id }, { receiver_id: user.id }]
      }, "-created_date", 0);
      setMessages(aiMessages.sort((a,b) => new Date(a.created_date) - new Date(b.created_date)));
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user, loadMessages]);

  const handleSendMessage = async (messageText = newMessage) => {
    if (!messageText.trim() || !user) return;
    
    setIsSending(true);
    const userMessage = {
      sender_id: user.id,
      receiver_id: 'ai_assistant',
      message: messageText,
      is_ai_message: true,
      created_date: new Date().toISOString()
    };

    try {
      await ChatMessage.create(userMessage);
      setMessages(prev => [...prev, userMessage]);
      setNewMessage("");

      try {
        const aiResponse = await InvokeLLM({
          prompt: `You are an expert AI engineering tutor assistant with deep knowledge in all engineering disciplines including Computer Science, Electrical, Mechanical, Civil, Chemical, and Aerospace Engineering.

User's Question: "${messageText}"

CRITICAL INSTRUCTIONS - Read the user's intent carefully:

1. IF THE USER ASKS FOR CODE/PROGRAMMING/IMPLEMENTATION:
   - Provide ONLY the code with minimal comments
   - Do NOT add lengthy explanations before or after the code
   - Keep it clean and focused on the code itself
   - Use brief inline comments only when absolutely necessary
   - Example keywords: "write code", "give me code", "implement", "program", "create function", "code for", "how to code"

2. IF THE USER ASKS FOR EXPLANATION/CONCEPT/THEORY:
   - Provide a clear explanation WITHOUT code examples
   - Focus on concepts, definitions, and theoretical understanding
   - Use simple language and break down complex ideas
   - Example keywords: "explain", "what is", "how does", "why", "difference between", "tell me about"

3. IF THE USER ASKS FOR BOTH (e.g., "explain and show code"):
   - Provide a brief explanation (2-3 sentences)
   - Then provide the code
   - Keep both parts concise

4. FOR PROBLEM-SOLVING QUESTIONS:
   - Show step-by-step solution with formulas
   - Include final answer
   - Keep explanations brief and focused

5. FOR GREETINGS:
   - Respond warmly and briefly
   - Ask how you can help with their engineering studies

IMPORTANT RULES:
- Match your response type to the user's request
- If they want code, give code - not paragraphs of text
- If they want explanation, explain - don't add unnecessary code
- Be precise and direct
- Don't over-explain unless specifically asked

Now respond appropriately based on the user's question type.`,
        });
        
        const aiMessage = {
          sender_id: 'ai_assistant',
          receiver_id: user.id,
          message: typeof aiResponse === 'object' ? JSON.stringify(aiResponse) : aiResponse,
          is_ai_message: true,
          created_date: new Date().toISOString()
        };
        
        await ChatMessage.create(aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error with AI response:", error);
        const errorMessage = {
          sender_id: 'ai_assistant',
          receiver_id: user.id,
          message: "I apologize, but I'm having trouble processing your request right now. This could be due to a temporary issue with my systems. Please try asking your question again, or rephrase it slightly. I'm here to help with any engineering concepts, problems, or questions you have!",
          is_ai_message: true,
          created_date: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    
    setIsSending(false);
  };

  const handleSuggestedPrompt = (prompt) => {
    setNewMessage(prompt);
    handleSendMessage(prompt);
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:to-purple-900 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-3">
            AI Study Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Your 24/7 engineering tutor, ready to help with any question
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
            {/* Decorative gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-20 blur-xl"></div>
            
            <CardHeader className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-t-lg p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">AI Engineering Assistant</CardTitle>
                  <CardDescription className="text-pink-100">
                    Ask me anything about engineering concepts, formulas, or study help
                  </CardDescription>
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-2">
                  <Zap className="w-4 h-4 mr-1" />
                  Online
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="relative p-0">
              {/* Messages Area */}
              <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800">
                <div className="max-w-4xl mx-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <Bot className="w-12 h-12 text-white" />
                        </div>
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Welcome to your AI Study Assistant!
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
                        I'm here to help you with engineering concepts, problem-solving, and study questions. I'll keep my answers concise and focused.
                      </p>
                      
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Try these sample questions:
                        </p>
                        <div className="grid gap-3 max-w-2xl mx-auto">
                          {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              whileHover={{ scale: 1.02, x: 5 }}
                            >
                              <Button
                                variant="outline"
                                onClick={() => handleSuggestedPrompt(prompt)}
                                className="w-full text-left h-auto p-4 border-2 hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all"
                              >
                                <Lightbulb className="w-5 h-5 mr-3 flex-shrink-0 text-yellow-500" />
                                <span className="font-medium">{prompt}</span>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-4 ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.sender_id !== user.id && (
                            <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-purple-200 shadow-lg">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                                <Bot className="w-5 h-5 text-white" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`flex flex-col max-w-[75%] ${message.sender_id === user.id ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-2xl shadow-lg break-words ${
                              message.sender_id === user.id 
                                ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white rounded-br-md' 
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md border border-slate-200 dark:border-slate-700'
                            }`}>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 px-2">
                              {formatMessageTime(message.created_date)}
                            </p>
                          </div>

                          {message.sender_id === user.id && (
                            <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-purple-200 shadow-lg">
                              <AvatarImage src={user.profile_picture} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                                <UserIcon className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                      
                      {isSending && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4 justify-start"
                        >
                          <Avatar className="w-10 h-10 border-2 border-purple-200 shadow-lg">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                              <Bot className="w-5 h-5 text-white" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col max-w-[75%]">
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 rounded-bl-md border border-slate-200 dark:border-slate-700 shadow-lg">
                              <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200" />

              {/* Input Area with Beautiful CSS Background */}
              <div className="relative p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-800 dark:via-purple-900/20 dark:to-pink-900/20">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-orange-400/10"></div>
                </div>
                
                <div className="max-w-4xl mx-auto relative">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-3"
                  >
                    <div className="flex-1 relative group">
                      {/* Glowing border effect on focus */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-30 transition-opacity duration-300"></div>
                      
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask me about engineering concepts, formulas, or any study question..."
                        disabled={isSending}
                        className="relative bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 rounded-2xl h-14 px-6 text-base shadow-lg transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white font-medium"
                      />
                      
                      {/* Sparkle decoration */}
                      {!newMessage && (
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 opacity-50"
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isSending || !newMessage.trim()}
                      className="h-14 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </form>
                  
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                    💡 Pro tip: Ask specific questions for better answers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
