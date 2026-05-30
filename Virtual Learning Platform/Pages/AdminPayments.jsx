
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Payment } from "@/entities/Payment";
import { Certificate } from "@/entities/Certificate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, Search, DollarSign, TrendingUp, 
  Users, Download, CheckCircle, XCircle, Clock, Edit
} from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function AdminPaymentsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    completedPayments: 0,
    pendingPayments: 0
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin' && !user.is_admin) {
        window.location.href = createPageUrl("Home");
        return;
      }
      setCurrentUser(user);
      await loadPayments();
    } catch (error) {
      window.location.href = createPageUrl("Home");
    }
    setIsLoading(false);
  }, []);

  const filterPayments = useCallback(() => {
    let filtered = payments;
    
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    filterPayments();
  }, [filterPayments]);

  const loadPayments = async () => {
    try {
      const paymentsData = await Payment.list("-payment_date");
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
      
      // Calculate stats
      const totalRevenue = paymentsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      setStats({
        totalRevenue,
        totalTransactions: paymentsData.length,
        completedPayments: paymentsData.filter(p => p.status === 'completed').length,
        pendingPayments: paymentsData.filter(p => p.status === 'pending').length
      });
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdatePayment = async (paymentData) => {
    try {
      await Payment.update(selectedPayment.id, paymentData);
      setIsEditDialogOpen(false);
      setSelectedPayment(null);
      await loadPayments();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      completed: "bg-green-600 text-white",
      pending: "bg-yellow-600 text-white",
      failed: "bg-red-600 text-white",
      refunded: "bg-gray-600 text-white"
    };
    
    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
          <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
          <p className="text-slate-400">Monitor transactions and certificate sales</p>
        </div>
        <Badge className="bg-green-600 text-white px-4 py-2">
          <DollarSign className="w-4 h-4 mr-2" />
          ${stats.totalRevenue.toFixed(2)} Revenue
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-400">
              From certificate sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTransactions}</div>
            <p className="text-xs text-slate-400">
              All payment attempts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Completed Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completedPayments}</div>
            <p className="text-xs text-slate-400">
              Successful transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
            <p className="text-xs text-slate-400">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by transaction ID or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Payment Transactions ({filteredPayments.length})</CardTitle>
          <CardDescription className="text-slate-400">
            Showing {filteredPayments.length} of {payments.length} payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Transaction ID</TableHead>
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Certificate</TableHead>
                <TableHead className="text-slate-300">Amount</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Date</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell className="text-white font-mono text-sm">
                    {payment.transaction_id}
                  </TableCell>
                  <TableCell className="text-white">
                    {payment.user_id}
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="truncate max-w-xs" title={payment.certificate_id}>
                      {payment.certificate_id}
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-semibold">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(payment.status)}
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPayment(payment)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {payment.status === 'completed' && payment.download_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(payment.download_url, '_blank')}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No payments found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
      
       {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Payment: {selectedPayment?.transaction_id}</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <EditPaymentForm
              payment={selectedPayment}
              onSave={handleUpdatePayment}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function EditPaymentForm({ payment, onSave, onCancel }) {
  const [status, setStatus] = useState(payment.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status" className="text-slate-300">Payment Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
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
