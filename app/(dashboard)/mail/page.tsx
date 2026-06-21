"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getMailSettings, updateMailSettings, sendTestEmail } from "@/lib/actions/mail-actions";
import type { Mail, UpdateMailInput } from "@/lib/types/mail";
import { toast } from "sonner";
import { Loader2, Save, Send } from "lucide-react";

export default function MailPage() {
  const [settings, setSettings] = useState<Mail | null>(null);
  const [formData, setFormData] = useState<UpdateMailInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testEmailError, setTestEmailError] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    getMailSettings().then((data) => {
      setSettings(data);
      setFormData({
        smtp_host: data.smtp_host || "",
        smtp_port: data.smtp_port || 587,
        smtp_secure: data.smtp_secure,
        smtp_user: data.smtp_user || "",
        smtp_pass: data.smtp_pass || "",
        smtp_from: data.smtp_from || "",
        sender_name: data.sender_name || "",
      });
      setLoading(false);
    });
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.smtp_host) newErrors.smtp_host = "SMTP Host is required";
    if (!formData.smtp_from) newErrors.smtp_from = "From Email is required";
    if (!formData.sender_name) newErrors.sender_name = "Sender Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await updateMailSettings(formData);
      setSettings(updated);
      toast.success("Mail settings saved successfully");
    } catch {
      toast.error("Failed to save mail settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      setTestEmailError("Recipient email is required");
      return;
    }
    setTestEmailError("");
    setSendingTest(true);
    try {
      const result = await sendTestEmail(testEmail);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const updateField = (field: keyof UpdateMailInput, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/mail">
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#f0f4f8] -mx-6 px-6 py-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] lg:text-3xl">
              Mail Settings
            </h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">
              Configure SMTP email settings and test message delivery
            </p>
          </div>
        </div>
      </div>

      <form id="mail-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* SMTP Server */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">SMTP Server</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Host *</Label>
                  <Input
                    id="smtp_host"
                    value={formData.smtp_host || ""}
                    onChange={(e) => updateField("smtp_host", e.target.value)}
                    placeholder="e.g., smtp.gmail.com"
                    className={errors.smtp_host ? "border-red-500" : ""}
                  />
                  {errors.smtp_host && (
                    <p className="text-xs text-red-500">{errors.smtp_host}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={formData.smtp_port ?? 587}
                    onChange={(e) => updateField("smtp_port", parseInt(e.target.value) || 587)}
                    placeholder="587"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="smtp_secure"
                    checked={formData.smtp_secure || false}
                    onCheckedChange={(checked) => updateField("smtp_secure", !!checked)}
                  />
                  <Label htmlFor="smtp_secure" className="cursor-pointer">
                    Use TLS/SSL
                  </Label>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* SMTP Authentication */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">SMTP Authentication</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_user">Username</Label>
                  <Input
                    id="smtp_user"
                    value={formData.smtp_user || ""}
                    onChange={(e) => updateField("smtp_user", e.target.value)}
                    placeholder="e.g., user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_pass">Password</Label>
                  <Input
                    id="smtp_pass"
                    type="password"
                    value={formData.smtp_pass || ""}
                    onChange={(e) => updateField("smtp_pass", e.target.value)}
                    placeholder="Enter SMTP password"
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Sender Info */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Sender Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_from">From Email *</Label>
                  <Input
                    id="smtp_from"
                    type="email"
                    value={formData.smtp_from || ""}
                    onChange={(e) => updateField("smtp_from", e.target.value)}
                    placeholder="e.g., noreply@example.com"
                    className={errors.smtp_from ? "border-red-500" : ""}
                  />
                  {errors.smtp_from && (
                    <p className="text-xs text-red-500">{errors.smtp_from}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_name">Sender Name *</Label>
                  <Input
                    id="sender_name"
                    value={formData.sender_name || ""}
                    onChange={(e) => updateField("sender_name", e.target.value)}
                    placeholder="e.g., IT Asset Manager"
                    className={errors.sender_name ? "border-red-500" : ""}
                  />
                  {errors.sender_name && (
                    <p className="text-xs text-red-500">{errors.sender_name}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Test Email */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Test Email</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-[#64748b]">
                  Send a test email to verify your SMTP settings are working correctly.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="test_email">Recipient Email</Label>
                  <Input
                    id="test_email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => {
                      setTestEmail(e.target.value);
                      if (testEmailError) setTestEmailError("");
                    }}
                    placeholder="e.g., recipient@example.com"
                    className={testEmailError ? "border-red-500" : ""}
                  />
                  {testEmailError && (
                    <p className="text-xs text-red-500">{testEmailError}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="w-full"
                >
                  {sendingTest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </form>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          type="submit"
          form="mail-form"
          disabled={saving}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-full shadow-lg shadow-[#3b82f6]/30 h-auto"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </PageGuard>
  );
}
