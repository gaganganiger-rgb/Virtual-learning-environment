
import React, { useState, useEffect } from "react";
import { Book } from "@/entities/Book";
import { User } from "@/entities/User";
import { BookAccess } from "@/entities/BookAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Library, Search, BookOpen, CreditCard, Clock, 
  FileText, Eye, Lock, CheckCircle, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function LibraryPage() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [bookAccess, setBookAccess] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookViewerOpen, setIsBookViewerOpen] = useState(false);
  const [isCardVerificationOpen, setIsCardVerificationOpen] = useState(false);
  const [libraryCardNumber, setLibraryCardNumber] = useState("");
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    document.title = "VirtEnv - Digital Library";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [booksData, accessData] = await Promise.all([
        Book.list(),
        BookAccess.filter({ user_id: userData.id })
      ]);

      setBooks(booksData);
      setBookAccess(accessData);
    } catch (error) {
      console.error("Error loading library data:", error);
    }
    setIsLoading(false);
  };

  const handleReadBook = async (book) => {
    setSelectedBook(book);
    setIsCardVerificationOpen(true);
    setLibraryCardNumber("");
    setCardError("");
  };

  const handleCardVerification = async () => {
    setCardError("");
    
    // Verify library card number matches user's assigned card
    if (!user.library_card_number) {
      setCardError("You don't have a library card assigned. Please contact the administrator.");
      return;
    }

    if (libraryCardNumber !== user.library_card_number) {
      setCardError("Invalid library card number. Please check your card number and try again.");
      return;
    }

    try {
      // Record book access
      const existingAccess = bookAccess.find(access => access.book_id === selectedBook.id);
      if (!existingAccess) {
        await BookAccess.create({
          user_id: user.id,
          book_id: selectedBook.id,
          access_date: new Date().toISOString(),
          last_page: 1,
          reading_progress: 0
        });
        await loadData();
      }

      setIsCardVerificationOpen(false);
      setIsBookViewerOpen(true);
    } catch (error) {
      console.error("Error accessing book:", error);
      setCardError("Error accessing book. Please try again.");
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory && book.is_available;
  });

  const categories = [...new Set(books.map(book => book.category))];

  const getAccessedBooks = () => {
    return bookAccess.map(access => {
      const book = books.find(b => b.id === access.book_id);
      return { ...book, access };
    }).filter(book => book.title);
  };

  // Get short description (2 lines max)
  const getShortDescription = (description, maxLength = 120) => {
    if (!description) return "No description available";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Digital Library
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-4">
            Access thousands of engineering books and resources
          </p>
          <div className="flex justify-center">
            {user?.library_card_number ? (
              <Badge className="bg-blue-500 text-white font-mono text-lg px-4 py-2">
                <CreditCard className="w-4 h-4 mr-2" />
                Library Card: {user.library_card_number}
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                No Library Card Assigned
              </Badge>
            )}
          </div>
        </motion.div>

        {!user?.library_card_number && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
                  Library Card Required
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">
                  You need a library card to access books. Please contact the administrator to get one assigned.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by title, author, or description..."
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Books ({filteredBooks.length})</TabsTrigger>
            <TabsTrigger value="accessed">My Reading History ({getAccessedBooks().length})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full shadow-xl border-0 overflow-hidden group">
                    <div className="relative">
                      {book.cover_image ? (
                        <img 
                          src={book.cover_image} 
                          alt={book.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-indigo-100 text-indigo-800">
                          {book.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">by {book.author}</p>
                      
                      {/* 2-line short description */}
                      <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-1">
                        {getShortDescription(book.description)}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        {book.pages && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {book.pages} pages
                          </span>
                        )}
                        {book.publication_year && (
                          <span>{book.publication_year}</span>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleReadBook(book)}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        disabled={!user?.library_card_number}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Read Online
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-16">
                <Library className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No books found</h3>
                <p className="text-slate-500">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="accessed" className="mt-6">
            {getAccessedBooks().length > 0 ? (
              <div className="grid gap-4">
                {getAccessedBooks().map((book) => (
                  <Card key={book.id} className="shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                          <p className="text-slate-600 mb-2">by {book.author}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Last accessed: {new Date(book.access.access_date).toLocaleDateString()}</span>
                            <span>Progress: {book.access.reading_progress}%</span>
                            <span>Page {book.access.last_page}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleReadBook(book)}
                          variant="outline"
                          className="ml-4"
                          disabled={!user?.library_card_number}
                        >
                          Continue Reading
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No reading history</h3>
                <p className="text-slate-500">Start reading books to see your history here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Library Card Verification Dialog */}
        <Dialog open={isCardVerificationOpen} onOpenChange={setIsCardVerificationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Library Card Verification
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-4">
                <Lock className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Enter Library Card Number</h3>
                <p className="text-slate-600 mb-4">
                  To access "{selectedBook?.title}", please enter your library card number.
                </p>
                {user?.library_card_number && (
                  <p className="text-sm text-slate-500 mb-4">
                    💡 Hint: Your library card number is displayed on your profile.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cardNumber">Library Card Number</Label>
                <Input
                  id="cardNumber"
                  value={libraryCardNumber}
                  onChange={(e) => setLibraryCardNumber(e.target.value)}
                  placeholder="Enter your library card number"
                  className="font-mono text-center text-lg"
                />
                {cardError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {cardError}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCardVerificationOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCardVerification}
                  disabled={!libraryCardNumber.trim() || !user?.library_card_number}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify & Access
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Book Viewer Dialog */}
        <Dialog open={isBookViewerOpen} onOpenChange={setIsBookViewerOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedBook?.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {selectedBook?.pdf_url ? (
                <iframe
                  src={selectedBook.pdf_url}
                  className="w-full h-full min-h-96"
                  title={selectedBook.title}
                />
              ) : (
                <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{selectedBook?.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      by {selectedBook?.author}
                    </p>
                    <p className="text-slate-500 text-sm max-w-md">
                      {selectedBook?.description}
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        📚 Book content will be available when PDF is uploaded by admin
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
