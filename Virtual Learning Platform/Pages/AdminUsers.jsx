
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Search, Edit, Trash2, UserPlus, Shield, 
  UserCheck, UserX, Eye, Settings 
} from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Memoize loadUsers since it's called by checkAdminAccess
  const loadUsers = useCallback(async () => {
    try {
      const usersData = await User.list("-created_date");
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }, []); // Dependencies are stable (setUsers, setFilteredUsers, User.list)

  // Memoize checkAdminAccess, depending on loadUsers
  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin' && !user.is_admin) {
        window.location.href = createPageUrl("Home");
        return;
      }
      setCurrentUser(user);
      await loadUsers(); // Now loadUsers is a stable reference
    } catch (error) {
      window.location.href = createPageUrl("Home");
    }
    setIsLoading(false);
  }, [loadUsers]); // Include loadUsers in dependencies

  // Memoize filterUsers, depending on users and searchTerm
  const filterUsers = useCallback(() => {
    const filtered = users.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.university && user.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.library_card_number && user.library_card_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]); // Dependencies are users and searchTerm

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]); // Now checkAdminAccess is a stable dependency

  useEffect(() => {
    filterUsers();
  }, [filterUsers]); // Now filterUsers is a stable dependency

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
       // Check for library card uniqueness
      if (userData.library_card_number) {
        const existingUser = users.find(u => u.library_card_number === userData.library_card_number && u.id !== selectedUser.id);
        if (existingUser) {
          alert(`Library Card number ${userData.library_card_number} is already assigned to ${existingUser.full_name}. Please use a unique number.`);
          return;
        }
      }
      
      await User.update(selectedUser.id, userData);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      await loadUsers(); // Calls the memoized loadUsers
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await User.delete(userId);
        await loadUsers(); // Calls the memoized loadUsers
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const getUserRoleBadge = (user) => {
    if (user.role === 'admin' || user.is_admin) {
      return <Badge className="bg-red-600 text-white"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
    }
    return <Badge variant="outline">Student</Badge>;
  };

  const getUserStatusBadge = (user) => {
    const lastActivity = user.last_activity ? new Date(user.last_activity) : null;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    if (lastActivity && lastActivity > weekAgo) {
      return <Badge className="bg-green-600"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>;
    }
    return <Badge variant="outline"><UserX className="w-3 h-3 mr-1" />Inactive</Badge>;
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
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">Manage platform users and their permissions</p>
        </div>
        <Badge className="bg-blue-600 text-white px-4 py-2">
          <Users className="w-4 h-4 mr-2" />
          {users.length} Total Users
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, university, or library card number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-slate-400">
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Library Card</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Progress</TableHead>
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
                        <p className="text-sm text-slate-400">{user.email}</p>
                        {user.university && (
                          <p className="text-xs text-slate-500">{user.university}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.library_card_number ? (
                       <Badge className="font-mono bg-blue-600">{user.library_card_number}</Badge>
                    ) : (
                       <Badge variant="outline" className="border-slate-600 text-slate-400">Not Set</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getUserRoleBadge(user)}</TableCell>
                  <TableCell>{getUserStatusBadge(user)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Points:</span>
                        <span className="text-white">{user.points || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Courses:</span>
                        <span className="text-white">{user.completed_courses?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Certificates:</span>
                        <span className="text-white">{user.certificate_purchases?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Quizzes:</span>
                        <span className="text-white">{user.quiz_attempts?.length || 0}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)} // Using handleEditUser for view as well, for now
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No users found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSave={handleUpdateUser}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function EditUserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    university: user.university || '',
    major: user.major || '',
    year_of_study: user.year_of_study || 1,
    library_card_number: user.library_card_number || '',
    certificate_purchases: user.certificate_purchases?.length || 0, // Assuming count for now
    quiz_attempts: user.quiz_attempts?.length || 0, // Assuming count for now
    is_admin: user.is_admin || false,
    points: user.points || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare data for saving. For certificate_purchases and quiz_attempts,
    // if they are just counts, we might need to decide how to handle the actual data on the backend.
    // For now, we'll just send the numbers as is. If the backend expects arrays,
    // this would need more complex logic (e.g., adding/removing items from a list).
    // Assuming backend will handle number directly or ignore if it expects array object.
    const dataToSave = {
      ...formData,
      // For simplicity, we convert the length back to a potential array if the backend expects it,
      // or assume the backend handles just a count if that's the intent.
      // If we're modifying the *count* directly, the backend should be prepared to receive a number.
      // If the backend expects an array of objects, this would need a more complex state management
      // to edit individual certificate/quiz entries. For this implementation, we assume we're just setting a count.
      // If `user.certificate_purchases` or `user.quiz_attempts` are actual arrays of IDs/objects,
      // editing their count directly like this is simplified.
      // A more robust implementation would involve displaying and editing individual items.
      certificate_purchases: Array(formData.certificate_purchases).fill({}).map((_, i) => ({ id: `cert-${i}`, name: `Certificate ${i+1}` })),
      quiz_attempts: Array(formData.quiz_attempts).fill({}).map((_, i) => ({ id: `quiz-${i}`, score: 0 })),
    };

    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <div>
        <Label htmlFor="library_card_number" className="text-slate-300">Library Card Number</Label>
        <Input
          id="library_card_number"
          value={formData.library_card_number}
          onChange={(e) => setFormData({...formData, library_card_number: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white font-mono"
          placeholder="Assign a unique card number"
        />
      </div>

      <div>
        <Label htmlFor="university" className="text-slate-300">University</Label>
        <Input
          id="university"
          value={formData.university}
          onChange={(e) => setFormData({...formData, university: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="major" className="text-slate-300">Major</Label>
          <Select 
            value={formData.major} 
            onValueChange={(value) => setFormData({...formData, major: value})}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select major" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
              <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
              <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="year_of_study" className="text-slate-300">Year of Study</Label>
          <Input
            id="year_of_study"
            type="number"
            min="1"
            max="5"
            value={formData.year_of_study}
            onChange={(e) => setFormData({...formData, year_of_study: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="points" className="text-slate-300">Points</Label>
          <Input
            id="points"
            type="number"
            min="0"
            value={formData.points}
            onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="certificate_purchases" className="text-slate-300">Certificates</Label>
          <Input
            id="certificate_purchases"
            type="number"
            min="0"
            value={formData.certificate_purchases}
            onChange={(e) => setFormData({...formData, certificate_purchases: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="quiz_attempts" className="text-slate-300">Quiz Attempts</Label>
          <Input
            id="quiz_attempts"
            type="number"
            min="0"
            value={formData.quiz_attempts}
            onChange={(e) => setFormData({...formData, quiz_attempts: parseInt(e.target.value)})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>


      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_admin"
          checked={formData.is_admin}
          onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
          className="rounded"
        />
        <Label htmlFor="is_admin" className="text-slate-300">
          Grant Admin Access
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
