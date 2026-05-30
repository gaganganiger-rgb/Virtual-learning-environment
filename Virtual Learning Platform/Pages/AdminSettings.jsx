import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { SystemSetting } from "@/entities/SystemSetting";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Settings, Save, CreditCard, Plus, Trash2, Upload, Image
} from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function AdminSettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [newSetting, setNewSetting] = useState({ key: "", value: "" });
  const [paymentQRCode, setPaymentQRCode] = useState("");
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [qrPreview, setQrPreview] = useState("");

  const checkAdminAccess = useCallback(async () => {
    try {
      const user = await User.me();
      if (user.role !== 'admin' && !user.is_admin) {
        window.location.href = createPageUrl("Home");
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      window.location.href = createPageUrl("Home");
    }
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settingsData = await SystemSetting.list();
      setSettings(settingsData);

      const qrSetting = settingsData.find(s => s.key === 'payment_qr_code');
      if (qrSetting) {
        setPaymentQRCode(qrSetting.value);
        setQrPreview(qrSetting.value);
      } else {
        setPaymentQRCode("");
        setQrPreview("");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setSettings([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (currentUser) {
      loadSettings();
    }
  }, [currentUser]);

  const handleQRCodeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    setIsUploadingQR(true);
    try {
      const { file_url } = await UploadFile({ file });
      setPaymentQRCode(file_url);
      setQrPreview(file_url);
      alert('QR Code uploaded successfully! Remember to click "Save Payment QR Code" to apply changes.');
    } catch (error) {
      console.error('Error uploading QR code:', error);
      alert('Failed to upload QR code. Please try again.');
    }
    setIsUploadingQR(false);
  };

  const handleSavePaymentQR = async () => {
    if (!paymentQRCode) {
      alert("Please upload a QR code first.");
      return;
    }

    try {
      const qrSetting = settings.find(s => s.key === 'payment_qr_code');
      if (qrSetting) {
        await SystemSetting.update(qrSetting.id, { value: paymentQRCode });
      } else {
        await SystemSetting.create({ 
          key: 'payment_qr_code', 
          value: paymentQRCode,
          description: 'QR code image for certificate payments',
          category: 'payment'
        });
      }
      alert("Payment QR Code saved successfully!");
      await loadSettings();
    } catch (error) {
      console.error("Error saving payment QR code:", error);
      alert("Failed to save QR code. Please try again.");
    }
  };

  const handleSaveNewSetting = async () => {
    if (!newSetting.key || !newSetting.value) {
      alert("Key and value cannot be empty.");
      return;
    }
    if (settings.some(s => s.key === newSetting.key)) {
      alert(`Setting with key '${newSetting.key}' already exists.`);
      return;
    }

    try {
      await SystemSetting.create({
        ...newSetting,
        category: 'general'
      });
      setNewSetting({ key: "", value: "" });
      await loadSettings();
      alert("New setting added successfully!");
    } catch (error) {
      console.error("Error creating new setting:", error);
      alert("Failed to add new setting.");
    }
  };

  const handleDeleteSetting = async (settingId) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      try {
        await SystemSetting.delete(settingId);
        await loadSettings();
        alert("Setting deleted successfully!");
      } catch (error) {
        console.error("Error deleting setting:", error);
        alert("Failed to delete setting.");
      }
    }
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
      <h1 className="text-3xl font-bold text-white mb-6">System Settings</h1>

      {/* Payment QR Code Upload Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment QR Code Configuration
          </CardTitle>
          <CardDescription className="text-slate-400">
            Upload your payment QR code. Students will scan this to make payments directly to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="qr_upload" className="text-slate-300">Upload QR Code Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="qr_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleQRCodeUpload}
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isUploadingQR}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={isUploadingQR}
                >
                  {isUploadingQR ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Supported formats: PNG, JPG, JPEG. Recommended size: 500x500px minimum.
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-300">QR Code Preview</Label>
              <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                {qrPreview ? (
                  <img 
                    src={qrPreview} 
                    alt="Payment QR Code" 
                    className="max-w-full max-h-[300px] rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="text-center text-slate-500">
                    <Image className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No QR code uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              How it works:
            </h4>
            <ul className="text-sm text-blue-200 space-y-1 ml-6 list-disc">
              <li>Upload your UPI/payment QR code that links to your account</li>
              <li>Students will see this QR code when purchasing certificates</li>
              <li>They scan the code and make payment directly to your account</li>
              <li>After payment, they mark it as completed in the system</li>
              <li>You can verify and approve payments in the Payment Management section</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-800/50 flex justify-end">
          <Button 
            onClick={handleSavePaymentQR} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!paymentQRCode || isUploadingQR}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Payment QR Code
          </Button>
        </CardFooter>
      </Card>

      {/* General System Settings Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General System Settings
          </CardTitle>
          <CardDescription className="text-slate-400">
            Advanced system key-value pairs. Be careful when editing these settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300 w-1/3">Key</TableHead>
                <TableHead className="text-slate-300 w-1/2">Value</TableHead>
                <TableHead className="text-slate-300 w-1/6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.filter(s => s.key !== 'payment_qr_code').map((setting) => (
                <TableRow key={setting.id} className="border-slate-700">
                  <TableCell className="text-white font-mono">{setting.key}</TableCell>
                  <TableCell className="text-white">{setting.value}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSetting(setting.id)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                      title="Delete setting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-slate-800/50 flex flex-wrap gap-4 pt-6">
          <Input
            placeholder="New setting key (e.g., 'platform_version')"
            value={newSetting.key}
            onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white flex-grow min-w-[150px]"
          />
          <Input
            placeholder="New setting value (e.g., '1.0.0')"
            value={newSetting.value}
            onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white flex-grow min-w-[150px]"
          />
          <Button onClick={handleSaveNewSetting} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Setting
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}