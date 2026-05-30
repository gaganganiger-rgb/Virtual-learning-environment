import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Certificate } from "@/entities/Certificate";
import { SystemSetting } from "@/entities/SystemSetting";
import { Payment } from "@/entities/Payment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, QrCode, AlertCircle, CheckCircle, Download, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PaymentsPage() {
  const [user, setUser] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [paymentQRCode, setPaymentQRCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "VirtEnv - Purchase Certificate";
    loadData();
  }, []);

  const loadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const certId = urlParams.get('certId');

    if (!certId) {
      setIsLoading(false);
      return;
    }

    try {
      const [userData, certData] = await Promise.all([
        User.me(),
        Certificate.filter({ id: certId }).then(res => res[0])
      ]);

      setUser(userData);
      setCertificate(certData);
      
      // Try to get payment QR code from settings
      try {
        const settingsData = await SystemSetting.list();
        const qrCodeSetting = settingsData.find(s => s.key === 'payment_qr_code');
        if (qrCodeSetting) {
          setPaymentQRCode(qrCodeSetting.value);
        }
      } catch (settingsError) {
        console.error("Error loading settings:", settingsError);
      }

    } catch (error) {
      console.error("Error loading payment data:", error);
    }
    setIsLoading(false);
  };

  const handleCompletePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Create payment record with completed status
      await Payment.create({
        user_id: user.id,
        certificate_id: certificate.id,
        amount: 80,
        transaction_id: `TXN-${user.id.slice(0, 4)}-${Date.now()}`,
        status: 'completed', // Immediately mark as completed
        payment_date: new Date().toISOString()
      });
      
      // Show success message
      setPaymentCompleted(true);
      
    } catch (error) {
      console.error("Error completing payment:", error);
      alert("There was an error processing your payment. Please try again.");
    }
    
    setIsProcessing(false);
  };

  const handleDownloadCertificate = () => {
    // Navigate to certificates page where they can download
    navigate(createPageUrl('Certificates'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Certificate</h2>
          <p className="text-slate-600 mb-6">The certificate you are trying to purchase could not be found.</p>
          <Link to={createPageUrl("Certificates")}>
            <Button><ArrowLeft className="w-4 h-4 mr-2"/>Back to Certificates</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-900 p-6 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!paymentCompleted ? (
          <motion.div
            key="payment"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg"
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold">Purchase Certificate</CardTitle>
                <CardDescription className="text-lg text-indigo-100">
                  for "{certificate.course_title}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="text-center">
                  <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-2xl font-bold mb-4 shadow-lg">
                    ₹80
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    One-time payment for lifetime access to your certificate
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 text-center flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Scan QR Code to Pay
                  </h3>
                  
                  {paymentQRCode ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-xl shadow-xl">
                          <img 
                            src={paymentQRCode} 
                            alt="Payment QR Code"
                            className="w-64 h-64 object-contain"
                          />
                        </div>
                      </div>
                      <div className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
                          <strong>How to pay:</strong>
                        </p>
                        <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 mt-2 ml-6 list-decimal">
                          <li>Open any UPI payment app (Google Pay, PhonePe, Paytm, etc.)</li>
                          <li>Scan the QR code above</li>
                          <li>Enter amount: ₹80</li>
                          <li>Complete the payment</li>
                          <li>Click the button below after successful payment</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <p className="font-semibold text-orange-600 dark:text-orange-400 mb-2">
                        Payment QR Code Not Configured
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Please contact the administrator to set up the payment method.
                      </p>
                    </div>
                  )}
                </div>

                {paymentQRCode && (
                  <>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-900 dark:text-blue-200 font-medium mb-1">
                            After completing the payment:
                          </p>
                          <p className="text-blue-700 dark:text-blue-300">
                            Click the button below to complete your purchase and download your certificate immediately!
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCompletePurchase} 
                      className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          I've Completed the Payment
                        </>
                      )}
                    </Button>
                  </>
                )}

                <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link to={createPageUrl("Certificates")}>
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Cancel and go back
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-16 h-16" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-2"
                >
                  Payment Successful! 🎉
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-green-50"
                >
                  Your certificate is now ready for download
                </motion.p>
                
                {/* Confetti effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      initial={{ 
                        x: "50%", 
                        y: "50%",
                        scale: 0 
                      }}
                      animate={{ 
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <CardContent className="p-8 space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <PartyPopper className="w-5 h-5" />
                    What's Next?
                  </h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-2 ml-6 list-disc">
                    <li>Your certificate is now available for download</li>
                    <li>You can download it anytime from your Certificates page</li>
                    <li>Print or save it as PDF for your records</li>
                    <li>Share your achievement on LinkedIn!</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleDownloadCertificate}
                    className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download My Certificate
                  </Button>

                  <Link to={createPageUrl("Courses")} className="block">
                    <Button 
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Explore More Courses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}