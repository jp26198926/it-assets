"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getAppSettings, updateAppSettings } from "@/lib/actions/application-actions";
import type { Application, UpdateApplicationInput } from "@/lib/types/application";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export default function ApplicationPage() {
  const [settings, setSettings] = useState<Application | null>(null);
  const [formData, setFormData] = useState<UpdateApplicationInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAppSettings().then((data) => {
      setSettings(data);
      setFormData({
        app_name: data.app_name,
        tagline: data.tagline,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        tin_number: data.tin_number || "",
        otp_expiry_duration: data.otp_expiry_duration,
        android_download_link: data.android_download_link || "",
        ios_download_link: data.ios_download_link || "",
        facebook_link: data.facebook_link || "",
        x_link: data.x_link || "",
        instagram_link: data.instagram_link || "",
      });
      setLoading(false);
    });
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.app_name) newErrors.app_name = "App Name is required";
    if (!formData.tagline) newErrors.tagline = "Tagline is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await updateAppSettings(formData);
      setSettings(updated);
      toast.success("Application settings saved successfully");
    } catch {
      toast.error("Failed to save application settings");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UpdateApplicationInput, value: string | number) => {
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
          {[1, 2, 3, 4, 5].map((i) => (
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
            Application Settings
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1">
            Configure your application settings and preferences
          </p>
        </div>
      </div>

      <form id="application-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* App Info */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">App Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app_name">App Name *</Label>
                  <Input
                    id="app_name"
                    value={formData.app_name || ""}
                    onChange={(e) => updateField("app_name", e.target.value)}
                    placeholder="e.g., IT Asset Manager"
                    className={errors.app_name ? "border-red-500" : ""}
                  />
                  {errors.app_name && (
                    <p className="text-xs text-red-500">{errors.app_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline *</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline || ""}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    placeholder="e.g., Manage your IT assets efficiently"
                    className={errors.tagline ? "border-red-500" : ""}
                  />
                  {errors.tagline && (
                    <p className="text-xs text-red-500">{errors.tagline}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Contact Info */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="e.g., admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="e.g., +63 912 345 6789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="e.g., 123 Main Street, Manila, Philippines"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin_number">TIN Number</Label>
                  <Input
                    id="tin_number"
                    value={formData.tin_number || ""}
                    onChange={(e) => updateField("tin_number", e.target.value)}
                    placeholder="e.g., 123-456-789-000"
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* OTP Settings */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">OTP Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp_expiry_duration">OTP Expiry Duration (minutes)</Label>
                  <Input
                    id="otp_expiry_duration"
                    type="number"
                    min={1}
                    value={formData.otp_expiry_duration ?? 5}
                    onChange={(e) => updateField("otp_expiry_duration", parseInt(e.target.value) || 5)}
                    placeholder="5"
                  />
                  <p className="text-xs text-[#64748b]">How long OTP codes remain valid (default: 5 minutes)</p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Download Links */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Download Links</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="android_download_link">Android Download Link</Label>
                  <Input
                    id="android_download_link"
                    value={formData.android_download_link || ""}
                    onChange={(e) => updateField("android_download_link", e.target.value)}
                    placeholder="e.g., https://play.google.com/store/apps/details?id=..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ios_download_link">iOS Download Link</Label>
                  <Input
                    id="ios_download_link"
                    value={formData.ios_download_link || ""}
                    onChange={(e) => updateField("ios_download_link", e.target.value)}
                    placeholder="e.g., https://apps.apple.com/app/id..."
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Social Links */}
          <ScrollReveal className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_link">Facebook Link</Label>
                    <Input
                      id="facebook_link"
                      value={formData.facebook_link || ""}
                      onChange={(e) => updateField("facebook_link", e.target.value)}
                      placeholder="e.g., https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="x_link">X Link</Label>
                    <Input
                      id="x_link"
                      value={formData.x_link || ""}
                      onChange={(e) => updateField("x_link", e.target.value)}
                      placeholder="e.g., https://x.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_link">Instagram Link</Label>
                    <Input
                      id="instagram_link"
                      value={formData.instagram_link || ""}
                      onChange={(e) => updateField("instagram_link", e.target.value)}
                      placeholder="e.g., https://instagram.com/yourhandle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </form>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          type="submit"
          form="application-form"
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
