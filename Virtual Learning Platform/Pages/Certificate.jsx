
import React, { useState, useEffect } from "react";
import { Certificate } from "@/entities/Certificate";
import { User } from "@/entities/User";
import { Payment } from "@/entities/Payment";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, Calendar, Trophy, Eye, Star, CheckCircle, ShoppingCart, AlertCircle, Download, Printer } from "lucide-react";
import { motion } from "framer-motion";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "VirtEnv - My Certificates";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [certificatesData, paymentsData] = await Promise.all([
        Certificate.filter({ user_id: userData.id }),
        Payment.filter({ user_id: userData.id })
      ]);
      
      setCertificates(certificatesData);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading certificates or payments:", error);
    }
    setIsLoading(false);
  };

  const getCertificatePaymentStatus = (certificateId) => {
    const payment = payments.find(p => p.certificate_id === certificateId);
    if (!payment) return 'unpaid';
    return payment.status;
  };
  
  const purchasedCertificates = certificates.filter(c => {
    const status = getCertificatePaymentStatus(c.id);
    return status === 'completed' || status === 'pending';
  });

  const handleDownloadCertificate = (certificate) => {
    // Open certificate in new window for printing/saving
    const printWindow = window.open('', '_blank');
    const certificateHTML = generateCertificateHTML(certificate);
    
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
    
    // Trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const generateCertificateHTML = (certificate) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${certificate.course_title}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .certificate {
            background: white;
            width: 297mm;
            height: 210mm;
            padding: 60px;
            box-shadow: 0 0 40px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #667eea;
            pointer-events: none;
          }
          .certificate::after {
            content: '';
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 1px solid #764ba2;
            pointer-events: none;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          .logo svg {
            width: 45px;
            height: 45px;
            fill: white;
          }
          h1 {
            font-size: 48px;
            color: #2d3748;
            margin-bottom: 10px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 18px;
            color: #667eea;
            font-weight: normal;
            letter-spacing: 3px;
            text-transform: uppercase;
          }
          .divider {
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
            margin: 30px auto;
          }
          .content {
            text-align: center;
            margin: 40px 0;
            position: relative;
            z-index: 1;
          }
          .awarded-to {
            font-size: 20px;
            color: #718096;
            margin-bottom: 15px;
            font-style: italic;
          }
          .recipient-name {
            font-size: 56px;
            color: #667eea;
            font-weight: bold;
            margin: 20px 0;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            display: inline-block;
            min-width: 400px;
          }
          .course-title {
            font-size: 32px;
            color: #2d3748;
            margin: 30px 0;
            font-weight: 600;
          }
          .completion-text {
            font-size: 18px;
            color: #718096;
            line-height: 1.8;
          }
          .score-badge {
            display: inline-block;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
          }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            position: relative;
            z-index: 1;
          }
          .footer-item {
            text-align: center;
            flex: 1;
          }
          .footer-label {
            font-size: 12px;
            color: #a0aec0;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .footer-value {
            font-size: 16px;
            color: #2d3748;
            font-weight: 600;
          }
          .seal {
            position: absolute;
            bottom: 80px;
            right: 100px;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(72, 187, 120, 0.5);
            z-index: 1;
          }
          .seal-inner {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 3px dashed white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          }
          .seal-text {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .seal-icon {
            font-size: 32px;
            margin-bottom: 5px;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(102, 126, 234, 0.03);
            font-weight: bold;
            pointer-events: none;
            z-index: 0;
            letter-spacing: 20px;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .certificate {
              box-shadow: none;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="watermark">VIRTENV</div>
          
          <div class="header">
            <div class="logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <h1>Certificate of Completion</h1>
            <p class="subtitle">Engineering Excellence</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="content">
            <p class="awarded-to">This is to certify that</p>
            <div class="recipient-name">${certificate.user_name}</div>
            <p class="completion-text">has successfully completed the course</p>
            <h2 class="course-title">${certificate.course_title}</h2>
            <p class="completion-text">with outstanding performance and dedication</p>
            <div class="score-badge">Score: ${certificate.score}%</div>
          </div>
          
          <div class="footer">
            <div class="footer-item">
              <div class="footer-label">Date of Completion</div>
              <div class="footer-value">${new Date(certificate.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div class="footer-item">
              <div class="footer-label">Certificate ID</div>
              <div class="footer-value">${certificate.certificate_id}</div>
            </div>
            <div class="footer-item">
              <div class="footer-label">Issued By</div>
              <div class="footer-value">VirtEnv Platform</div>
            </div>
          </div>
          
          <div class="seal">
            <div class="seal-inner">
              <div class="seal-icon">🏆</div>
              <div class="seal-text">Verified</div>
            </div>
          </div>
        </div>
        
        <script>
          // Print instructions
          console.log('To save as PDF: File > Print > Save as PDF');
        </script>
      </body>
      </html>
    `;
  };

  const generateCertificatePreview = (certificate) => {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white p-12 rounded-lg shadow-2xl border-8 border-blue-100">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Certificate of Completion</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded"></div>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-gray-600">This is to certify that</p>
            <h2 className="text-3xl font-bold text-blue-600 border-b-2 border-blue-200 pb-2 inline-block">
              {certificate.user_name}
            </h2>
            <p className="text-lg text-gray-600">has successfully completed the course</p>
            <h3 className="text-2xl font-semibold text-gray-800">
              {certificate.course_title}
            </h3>
            <div className="flex justify-center items-center gap-2">
              <span className="text-lg text-gray-600">with a score of</span>
              <Badge className="bg-green-600 text-white text-lg px-4 py-1">
                {certificate.score}%
              </Badge>
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-sm text-gray-500">Date of Completion</p>
                <p className="font-semibold text-gray-700">
                  {new Date(certificate.completion_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-700">VirtEnv</p>
                <p className="text-xs text-gray-500">Learning Platform</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-mono text-sm text-gray-700">
                  {certificate.certificate_id}
                </p>
              </div>
            </div>
            
            <div className="border-t-2 border-gray-200 pt-4">
              <p className="text-xs text-gray-400">
                This certificate verifies that the named individual has completed the requirements for the above course.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            My Certificates
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage your earned certificates from completed courses
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{purchasedCertificates.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Available Certificates</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {purchasedCertificates.length > 0 ? Math.round(purchasedCertificates.reduce((acc, cert) => acc + cert.score, 0) / purchasedCertificates.length) : 0}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Average Score</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {purchasedCertificates.filter(cert => cert.score >= 90).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Excellence Awards (90%+)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {certificates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate, index) => {
                const paymentStatus = getCertificatePaymentStatus(certificate.id);
                const canDownload = paymentStatus === 'completed' || paymentStatus === 'pending';
                
                return (
                <motion.div
                  key={certificate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm overflow-hidden group">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      <div className="flex items-center justify-between">
                        <Award className="w-8 h-8" />
                        <Badge className="bg-white/20 text-white">
                          Score: {certificate.score}%
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {certificate.course_title}
                      </CardTitle>
                      <CardDescription className="text-blue-100">
                        Certificate of Completion
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Completed on {new Date(certificate.completion_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-mono text-xs">
                            ID: {certificate.certificate_id}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <Badge 
                            variant="outline" 
                            className={`${
                              certificate.score >= 90 ? 'border-gold text-yellow-600' : 
                              certificate.score >= 80 ? 'border-silver text-gray-600' : 
                              'border-bronze text-orange-600'
                            }`}
                          >
                            {certificate.score >= 90 ? '🥇 Excellence' : 
                             certificate.score >= 80 ? '🥈 Merit' : 
                             '🥉 Achievement'}
                          </Badge>
                        </div>

                        <div className="pt-4 space-y-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview Certificate
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Certificate Preview</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                {generateCertificatePreview(certificate)}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {paymentStatus === 'unpaid' && (
                             <Link to={createPageUrl(`Payments?certId=${certificate.id}`)} className="w-full">
                              <Button className="w-full">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Purchase Certificate
                              </Button>
                            </Link>
                          )}
                          
                          {canDownload && (
                            <>
                              <Button 
                                onClick={() => handleDownloadCertificate(certificate)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Certificate
                              </Button>
                              <Button 
                                onClick={() => handleDownloadCertificate(certificate)}
                                variant="outline"
                                className="w-full"
                              >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Certificate
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )})}
            </div>
          ) : (
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <Award className="w-24 h-24 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  No certificates yet
                </h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Complete courses and pass quizzes to earn your first certificate. 
                  Each certificate recognizes your achievement and can be downloaded here.
                </p>
                <Button onClick={() => window.location.href = '/courses'}>
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
