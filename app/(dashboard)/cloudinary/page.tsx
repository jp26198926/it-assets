"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getCloudinarySettings, updateCloudinarySettings, testCloudinaryUpload } from "@/lib/actions/cloudinary-actions";
import type { Cloudinary, UpdateCloudinaryInput } from "@/lib/types/cloudinary";
import { toast } from "sonner";
import { Loader2, Save, Upload, Info, CheckCircle, ExternalLink } from "lucide-react";

export default function CloudinaryPage() {
  const [settings, setSettings] = useState<Cloudinary | null>(null);
  const [formData, setFormData] = useState<UpdateCloudinaryInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testFileError, setTestFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCloudinarySettings().then((data) => {
      setSettings(data);
      setFormData({
        cloud_name: data.cloud_name || "",
        api_key: data.api_key || "",
        api_secret: data.api_secret || "",
      });
      setLoading(false);
    });
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.cloud_name) newErrors.cloud_name = "Cloud Name is required";
    if (!formData.api_key) newErrors.api_key = "API Key is required";
    if (!formData.api_secret) newErrors.api_secret = "API Secret is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await updateCloudinarySettings(formData);
      setSettings(updated);
      toast.success("Cloudinary settings saved successfully");
    } catch {
      toast.error("Failed to save Cloudinary settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadTest = async () => {
    if (!testFile) {
      setTestFileError("Please select a file to upload");
      return;
    }
    setTestFileError("");
    setUploading(true);
    setUploadResult(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(testFile);
      });

      const result = await testCloudinaryUpload(base64, testFile.name);
      if (result.success) {
        toast.success(result.message);
        if (result.url) setUploadResult({ url: result.url });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to upload test file");
    } finally {
      setUploading(false);
    }
  };

  const updateField = (field: keyof UpdateCloudinaryInput, value: string) => {
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
            Cloudinary Settings
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1">
            Configure Cloudinary file storage settings
          </p>
        </div>
      </div>

      <form id="cloudinary-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cloudinary Configuration */}
          <ScrollReveal className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Cloudinary Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cloud_name">Cloud Name *</Label>
                    <Input
                      id="cloud_name"
                      value={formData.cloud_name || ""}
                      onChange={(e) => updateField("cloud_name", e.target.value)}
                      placeholder="e.g., my-cloud-name"
                      className={errors.cloud_name ? "border-red-500" : ""}
                    />
                    {errors.cloud_name && (
                      <p className="text-xs text-red-500">{errors.cloud_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key *</Label>
                    <Input
                      id="api_key"
                      type="password"
                      value={formData.api_key || ""}
                      onChange={(e) => updateField("api_key", e.target.value)}
                      placeholder="Enter your API key"
                      className={errors.api_key ? "border-red-500" : ""}
                    />
                    {errors.api_key && (
                      <p className="text-xs text-red-500">{errors.api_key}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_secret">API Secret *</Label>
                    <Input
                      id="api_secret"
                      type="password"
                      value={formData.api_secret || ""}
                      onChange={(e) => updateField("api_secret", e.target.value)}
                      placeholder="Enter your API secret"
                      className={errors.api_secret ? "border-red-500" : ""}
                    />
                    {errors.api_secret && (
                      <p className="text-xs text-red-500">{errors.api_secret}</p>
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
                    <p className="text-sm font-medium text-blue-900">File Storage Provider</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This system uses <strong>Cloudinary</strong> to store all uploaded files including
                      images, documents, and attachments. You will need a Cloudinary account to configure
                      file storage. Visit{" "}
                      <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                        cloudinary.com
                      </a>{" "}
                      to create an account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Test Upload */}
          <ScrollReveal className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-sm rounded-xl">
              <CardHeader className="border-b border-[#f0f4f8] px-6 py-4">
                <CardTitle className="text-lg font-semibold text-[#1a1f36]">Test Upload</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-[#64748b]">
                  Upload a test file to verify your Cloudinary configuration is working correctly.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setTestFile(file);
                          setTestFileError("");
                          setUploadResult(null);
                        }
                      }}
                      className={testFileError ? "border-red-500" : ""}
                    />
                    {testFileError && (
                      <p className="text-xs text-red-500">{testFileError}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadTest}
                    disabled={uploading || !testFile}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Test File
                      </>
                    )}
                  </Button>
                </div>

                {uploadResult && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">Upload Successful</p>
                        <div className="mt-2">
                          <img
                            src={uploadResult.url}
                            alt="Uploaded test"
                            className="max-w-xs max-h-48 rounded-lg border border-green-200"
                          />
                        </div>
                        <a
                          href={uploadResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-green-700 hover:text-green-900"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open in new tab
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </form>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          type="submit"
          form="cloudinary-form"
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
