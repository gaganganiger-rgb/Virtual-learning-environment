
import React, { useState, useEffect, useCallback } from "react";
import { Book } from "@/entities/Book";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Library, Plus, Edit, Trash2, Search, BookOpen, 
  Users, CreditCard, Eye, AlertCircle, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function AdminLibraryPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);
  const [isCardAssignOpen, setIsCardAssignOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [booksData, usersData] = await Promise.all([
        Book.list("-created_date"),
        User.list("-created_date")
      ]);
      setBooks(booksData);
      setUsers(usersData);
      setFilteredBooks(booksData);
      setFilteredUsers(usersData);
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

  const filterBooks = useCallback(() => {
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [books, searchTerm]);

  const filterUsers = useCallback(() => {
    const filtered = users.filter(user =>
      user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.library_card_number && user.library_card_number.toLowerCase().includes(userSearchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, userSearchTerm]);

  useEffect(() => {
    document.title = "VirtEnv - Admin Library Management";
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    filterBooks();
  }, [filterBooks]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleCreateBook = () => {
    setSelectedBook(null);
    setIsCreateBookOpen(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setIsBookDialogOpen(true);
  };

  const handleSaveBook = async (bookData) => {
    try {
      if (selectedBook) {
        await Book.update(selectedBook.id, bookData);
      } else {
        await Book.create(bookData);
      }
      setIsBookDialogOpen(false);
      setIsCreateBookOpen(false);
      setSelectedBook(null);
      await loadData();
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await Book.delete(bookId);
        await loadData();
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  const handleAssignCard = (user) => {
    setSelectedUser(user);
    setCardNumber(user.library_card_number || '');
    setIsCardAssignOpen(true);
  };

  const handleSaveCardNumber = async () => {
    try {
      // Check if card number is unique
      const existingUser = users.find(u => u.id !== selectedUser.id && u.library_card_number === cardNumber);
      if (existingUser) {
        alert("This card number is already assigned to another user. Please choose a different number.");
        return;
      }

      await User.update(selectedUser.id, { library_card_number: cardNumber });
      setIsCardAssignOpen(false);
      setSelectedUser(null);
      setCardNumber("");
      await loadData();
    } catch (error) {
      console.error("Error assigning card number:", error);
    }
  };

  const generateUniqueCardNumber = () => {
    const existingCards = users.map(u => u.library_card_number).filter(Boolean);
    let newCard;
    do {
      newCard = 'LIB' + Math.random().toString(36).substr(2, 9).toUpperCase();
    } while (existingCards.includes(newCard));
    setCardNumber(newCard);
  };

  const getCategoryBadge = (category) => {
    const colors = {
      "Computer Science": "bg-blue-600",
      "Electrical Engineering": "bg-yellow-600",
      "Mechanical Engineering": "bg-green-600",
      "Civil Engineering": "bg-red-600",
      "Chemical Engineering": "bg-purple-600",
      "Mathematics": "bg-indigo-600",
      "Physics": "bg-pink-600",
      "General": "bg-gray-600"
    };
    return <Badge className={colors[category] || "bg-gray-600"}>{category}</Badge>;
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
          <h1 className="text-3xl font-bold text-white mb-2">Library Management</h1>
          <p className="text-slate-400">Manage books and library card assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-600 text-white px-4 py-2">
            <Library className="w-4 h-4 mr-2" />
            {books.length} Total Books
          </Badge>
          <Badge className="bg-green-600 text-white px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            {users.filter(u => u.library_card_number).length}/{users.length} Cards Assigned
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="books" className="text-slate-300">Book Management</TabsTrigger>
          <TabsTrigger value="cards" className="text-slate-300">Library Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-6">
          {/* Books Section */}
          <div className="flex justify-between items-center">
            <Card className="bg-slate-800 border-slate-700 flex-1 mr-4">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search books by title, author, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={handleCreateBook}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Books ({filteredBooks.length})</CardTitle>
              <CardDescription className="text-slate-400">
                Showing {filteredBooks.length} of {books.length} books
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Book Details</TableHead>
                    <TableHead className="text-slate-300">Category</TableHead>
                    <TableHead className="text-slate-300">Pages</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {book.cover_image ? (
                            <img
                              src={book.cover_image}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-slate-600 rounded flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{book.title}</p>
                            <p className="text-sm text-slate-400">by {book.author}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 max-w-md">
                              {book.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(book.category)}</TableCell>
                      <TableCell>
                        <span className="text-slate-300">{book.pages || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={book.is_available ? "bg-green-600" : "bg-red-600"}>
                          {book.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBook(book)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBook(book.id)}
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

              {filteredBooks.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No books found matching your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          {/* Library Cards Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Library Card Management
              </CardTitle>
              <CardDescription className="text-slate-400">
                Assign unique library card numbers to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or card number..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">User</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Library Card</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profile_picture} />
                            <AvatarFallback className="bg-slate-600 text-white">
                              {user.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{user.full_name}</p>
                            <p className="text-sm text-slate-400">
                              {user.major} • Year {user.year_of_study || 1}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{user.email}</TableCell>
                      <TableCell>
                        {user.library_card_number ? (
                          <Badge className="bg-blue-500 font-mono">
                            {user.library_card_number}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 border-slate-600">
                            Not Assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.library_card_number ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignCard(user)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {user.library_card_number ? 'Edit Card' : 'Assign Card'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No users found matching your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Book Dialog */}
      <Dialog open={isCreateBookOpen} onOpenChange={setIsCreateBookOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <BookForm
            book={null}
            onSave={handleSaveBook}
            onCancel={() => setIsCreateBookOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Book: {selectedBook?.title}</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <BookForm
              book={selectedBook}
              onSave={handleSaveBook}
              onCancel={() => setIsBookDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Card Assignment Dialog */}
      <Dialog open={isCardAssignOpen} onOpenChange={setIsCardAssignOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Assign Library Card - {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber" className="text-slate-300">Library Card Number</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white font-mono"
                  placeholder="Enter unique card number"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateUniqueCardNumber}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Card numbers must be unique for each user
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCardAssignOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCardNumber}
                disabled={!cardNumber.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {selectedUser?.library_card_number ? 'Update Card' : 'Assign Card'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Book Form Component
function BookForm({ book, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    category: book?.category || '',
    cover_image: book?.cover_image || '',
    pdf_url: book?.pdf_url || '',
    pages: book?.pages || 0,
    isbn: book?.isbn || '',
    publication_year: book?.publication_year || new Date().getFullYear(),
    is_available: book?.is_available !== undefined ? book.is_available : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="author" className="text-slate-300">Author *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
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

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="pages" className="text-slate-300">Pages</Label>
          <Input
            id="pages"
            type="number"
            min="1"
            value={formData.pages}
            onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cover_image" className="text-slate-300">Cover Image URL</Label>
          <Input
            id="cover_image"
            value={formData.cover_image}
            onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div>
          <Label htmlFor="pdf_url" className="text-slate-300">PDF URL</Label>
          <Input
            id="pdf_url"
            value={formData.pdf_url}
            onChange={(e) => setFormData({...formData, pdf_url: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="https://example.com/book.pdf"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="isbn" className="text-slate-300">ISBN</Label>
          <Input
            id="isbn"
            value={formData.isbn}
            onChange={(e) => setFormData({...formData, isbn: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="publication_year" className="text-slate-300">Publication Year</Label>
          <Input
            id="publication_year"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.publication_year}
            onChange={(e) => setFormData({...formData, publication_year: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_available"
          checked={formData.is_available}
          onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
          className="rounded"
        />
        <Label htmlFor="is_available" className="text-slate-300">
          Book Available for Reading
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
          {book ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
}
