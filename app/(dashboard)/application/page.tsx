"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getAppSettings, updateAppSettings, uploadAppImage } from "@/lib/actions/application-actions";
import { getTimezoneSelectOptions } from "@/lib/actions/timezone-actions";
import type { Application, UpdateApplicationInput } from "@/lib/types/application";
import type { TimezoneSelectOption } from "@/lib/types/timezone";
import { toast } from "sonner";
import { Loader2, Save, Upload, X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function ApplicationPage() {
  const [settings, setSettings] = useState<Application | null>(null);
  const [formData, setFormData] = useState<UpdateApplicationInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [timezoneOptions, setTimezoneOptions] = useState<TimezoneSelectOption[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      getAppSettings(),
      getTimezoneSelectOptions(),
    ]).then(([appData, tzOptions]) => {
      setSettings(appData);
      setTimezoneOptions(tzOptions);
      setFormData({
        app_name: appData.app_name,
        tagline: appData.tagline,
        timezone: appData.timezone || "",
        email: appData.email || "",
        phone: appData.phone || "",
        address: appData.address || "",
        tin_number: appData.tin_number || "",
        otp_expiry_duration: appData.otp_expiry_duration,
        android_download_link: appData.android_download_link || "",
        ios_download_link: appData.ios_download_link || "",
        facebook_link: appData.facebook_link || "",
        x_link: appData.x_link || "",
        instagram_link: appData.instagram_link || "",
        app_logo: appData.app_logo || "",
        app_favicon: appData.app_favicon || "",
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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "app_logo" | "app_favicon",
    setUploading: (v: boolean) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadAppImage(base64, file.name);
      if (result.success && result.url) {
        updateField(field, result.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (field: "app_logo" | "app_favicon", ref: React.RefObject<HTMLInputElement | null>) => {
    updateField(field, "");
    if (ref.current) ref.current.value = "";
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
    <PageGuard pagePath="/application">
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
          {/* Branding */}
          <ScrollReveal>
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Branding</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* App Logo */}
                <div className="space-y-2">
                  <Label>App Logo</Label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "app_logo", setUploadingLogo)}
                  />
                  {formData.app_logo ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.app_logo}
                        alt="App Logo"
                        className="h-20 w-auto rounded-lg border border-[#e2e8f0] object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage("app_logo", logoInputRef)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-[#e2e8f0] text-[#64748b] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-5 w-5" />
                          <span className="text-xs">Upload Logo</span>
                        </div>
                      )}
                    </button>
                  )}
                  <p className="text-xs text-[#64748b]">Recommended: Square image, at least 128x128px</p>
                </div>

                {/* Favicon */}
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "app_favicon", setUploadingFavicon)}
                  />
                  {formData.app_favicon ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.app_favicon}
                        alt="Favicon"
                        className="h-10 w-10 rounded border border-[#e2e8f0] object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage("app_favicon", faviconInputRef)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon}
                      className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-[#e2e8f0] text-[#64748b] hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors"
                    >
                      {uploadingFavicon ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-5 w-5" />
                          <span className="text-xs">Upload Favicon</span>
                        </div>
                      )}
                    </button>
                  )}
                  <p className="text-xs text-[#64748b]">Recommended: 32x32 or 64x64px square image</p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

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
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={formData.timezone || "none"}
                    onValueChange={(v) => updateField("timezone", v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {timezoneOptions.map((tz) => (
                        <SelectItem key={tz.id} value={tz.id}>
                          {tz.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#64748b]">Default timezone for the application</p>
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
    </PageGuard>
  );
}
