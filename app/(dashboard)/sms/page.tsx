"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getSmsSettings, updateSmsSettings, sendTestSms } from "@/lib/actions/sms-actions";
import type { Sms, UpdateSmsInput } from "@/lib/types/sms";
import { toast } from "sonner";
import { Loader2, Save, Send, Info } from "lucide-react";

export default function SmsPage() {
  const [settings, setSettings] = useState<Sms | null>(null);
  const [formData, setFormData] = useState<UpdateSmsInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testPhoneError, setTestPhoneError] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    getSmsSettings().then((data) => {
      setSettings(data);
      setFormData({
        api_key: data.api_key || "",
        device_id: data.device_id || "",
      });
      setLoading(false);
    });
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.api_key) newErrors.api_key = "API Key is required";
    if (!formData.device_id) newErrors.device_id = "Device ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await updateSmsSettings(formData);
      setSettings(updated);
      toast.success("SMS settings saved successfully");
    } catch {
      toast.error("Failed to save SMS settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone) {
      setTestPhoneError("Phone number is required");
      return;
    }
    setTestPhoneError("");
    setSendingTest(true);
    try {
      const result = await sendTestSms(testPhone);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send test SMS");
    } finally {
      setSendingTest(false);
    }
  };

  const updateField = (field: keyof UpdateSmsInput, value: string) => {
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
          {[1, 2, 3].map((i) => (
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
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#f0f4f8] -mx-6 px-6 py-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] lg:text-3xl">
            SMS Settings
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1">
            Configure SMS gateway settings and test message delivery
          </p>
        </div>
      </div>

      <form id="sms-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* TextBee Configuration */}
          <ScrollReveal className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">TextBee Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key *</Label>
                    <Input
                      id="api_key"
                      type="password"
                      value={formData.api_key || ""}
                      onChange={(e) => updateField("api_key", e.target.value)}
                      placeholder="Enter your TextBee API key"
                      className={errors.api_key ? "border-red-500" : ""}
                    />
                    {errors.api_key && (
                      <p className="text-xs text-red-500">{errors.api_key}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="device_id">Device ID *</Label>
                    <Input
                      id="device_id"
                      value={formData.device_id || ""}
                      onChange={(e) => updateField("device_id", e.target.value)}
                      placeholder="Enter your TextBee device ID"
                      className={errors.device_id ? "border-red-500" : ""}
                    />
                    {errors.device_id && (
                      <p className="text-xs text-red-500">{errors.device_id}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Disclaimer */}
          <ScrollReveal className="lg:col-span-2">
            <Card className="border-0 bg-blue-50 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Supported SMS Gateway</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This application only supports <strong>TextBee</strong> as the SMS gateway provider.
                      You will need a TextBee account and an Android device running the TextBee app
                      to send and receive SMS messages. Visit{" "}
                      <a href="https://textbee.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                        textbee.dev
                      </a>{" "}
                      to get started.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Test SMS */}
          <ScrollReveal className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Test SMS</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-[#64748b]">
                  Send a test SMS to verify your TextBee configuration is working correctly.
                </p>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="test_phone">Phone Number</Label>
                    <Input
                      id="test_phone"
                      type="tel"
                      value={testPhone}
                      onChange={(e) => {
                        setTestPhone(e.target.value);
                        if (testPhoneError) setTestPhoneError("");
                      }}
                      placeholder="e.g., +639123456789"
                      className={testPhoneError ? "border-red-500" : ""}
                    />
                    {testPhoneError && (
                      <p className="text-xs text-red-500">{testPhoneError}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendTest}
                    disabled={sendingTest}
                    className="shrink-0"
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Test SMS
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </form>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          type="submit"
          form="sms-form"
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
    </div>
  );
}
