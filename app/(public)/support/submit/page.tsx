"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Upload, X, FileText, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/scroll-reveal";

interface SelectOptions {
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

interface FormData {
  name: string;
  email: string;
  title: string;
  description: string;
  category_id: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  department_id: string;
  asset_id: string;
  asset_barcode: string;
  asset_name: string;
  attachments: string[];
}

const defaultFormData: FormData = {
  name: "",
  email: "",
  title: "",
  description: "",
  category_id: "",
  priority: "Low",
  department_id: "",
  asset_id: "",
  asset_barcode: "",
  asset_name: "",
  attachments: [],
};

export default function SubmitTicketPage() {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SelectOptions>({ categories: [], departments: [] });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNo, setTicketNo] = useState("");

  useEffect(() => {
    fetch("/api/public/tickets/select-options")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOptions(res.data);
      })
      .catch(() => toast.error("Failed to load form options"))
      .finally(() => setOptionsLoading(false));

    fetch("/api/cloudinary")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setMaxFileSize(res.data?.max_file_size || 10);
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email address";
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.description.trim() || formData.description === "<p></p>") e.description = "Description is required";
    if (!formData.category_id) e.category_id = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("fileName", file.name);
    const res = await fetch("/api/tickets/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success && data.url) return data.url;
    toast.error(data.error || `Failed to upload ${file.name}`);
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const maxBytes = maxFileSize * 1024 * 1024;
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > maxBytes) {
        toast.error(`"${file.name}" exceeds the ${maxFileSize} MB limit`);
        continue;
      }
      valid.push(file);
    }
    setPendingFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleBarcodeLookup = async () => {
    const barcode = formData.asset_barcode.trim();
    if (!barcode) return;
    setBarcodeLoading(true);
    try {
      const res = await fetch(`/api/public/tickets/lookup-asset?barcode=${encodeURIComponent(barcode)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setFormData((prev) => ({
          ...prev,
          asset_id: data.data.id,
          asset_name: `${data.data.barcode} - ${data.data.itemName}`,
        }));
        toast.success("Asset found");
      } else {
        setFormData((prev) => ({ ...prev, asset_id: "", asset_name: "" }));
        toast.error("Asset not found for this barcode");
      }
    } catch {
      toast.error("Failed to lookup asset");
    } finally {
      setBarcodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      if (pendingFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of pendingFiles) {
          const url = await uploadFile(file);
          if (url) uploadedUrls.push(url);
        }
        setUploadingFiles(false);
      }

      const res = await fetch("/api/public/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          priority: formData.priority,
          department_id: formData.department_id || undefined,
          asset_id: formData.asset_id || undefined,
          attachments: [...formData.attachments, ...uploadedUrls],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTicketNo(data.data.ticket_no);
        setSubmitted(true);
      } else {
        toast.error(data.error || "Failed to submit ticket");
      }
    } catch {
      toast.error("Failed to submit ticket");
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const handleRichTextImageUpload = async (file: File): Promise<string | null> => {
    const maxBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`"${file.name}" exceeds the ${maxFileSize} MB limit`);
      return null;
    }
    return uploadFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <Link href="/support" className="text-sm text-[#64748b] hover:text-[#3b82f6] flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Support Portal
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 max-w-md w-full text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-[#22c55e]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1f36]">Ticket Submitted</h1>
              <p className="text-[#64748b]">
                Your support ticket has been created successfully.
              </p>
              <div className="bg-[#f8fafc] rounded-lg p-4">
                <p className="text-sm text-[#64748b]">Your ticket number</p>
                <p className="text-xl font-mono font-bold text-[#3b82f6]">{ticketNo}</p>
              </div>
              <p className="text-sm text-[#64748b]">
                A confirmation has been sent to <strong>{formData.email}</strong>.
                {formData.asset_name && (
                  <> The linked asset has been marked as &quot;Repair&quot;.</>
                )}
              </p>
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <Link href="/support/track">
                  <Button variant="outline">Track This Ticket</Button>
                </Link>
                <Link href="/support">
                  <Button>Submit Another</Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/support" className="text-sm text-[#64748b] hover:text-[#3b82f6] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Support Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1a1f36]">Submit a Support Ticket</h1>
                <p className="text-[#64748b] mt-1">
                  Fill in the details below and our team will get back to you.
                </p>
              </div>

              {optionsLoading ? (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6] mx-auto" />
                  <p className="text-[#64748b] mt-2">Loading form...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of the issue"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(html) => setFormData({ ...formData, description: html })}
                      onImageUpload={handleRichTextImageUpload}
                      placeholder="Describe your issue in detail... (You can paste images here)"
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                      >
                        <SelectTrigger className={`w-full ${errors.category_id ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v: "Low" | "Medium" | "High" | "Critical") =>
                          setFormData({ ...formData, priority: v })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Department (Optional)</Label>
                    <Select
                      value={formData.department_id || "none"}
                      onValueChange={(v) => setFormData({ ...formData, department_id: v === "none" ? "" : v })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {options.departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset Barcode (Optional)</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={formData.asset_barcode}
                        onChange={(e) => setFormData({ ...formData, asset_barcode: e.target.value, asset_id: "", asset_name: "" })}
                        placeholder="Enter asset barcode"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleBarcodeLookup();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBarcodeLookup}
                        disabled={barcodeLoading || !formData.asset_barcode.trim()}
                      >
                        {barcodeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look Up"}
                      </Button>
                    </div>
                    {formData.asset_name && (
                      <p className="text-sm text-[#22c55e] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {formData.asset_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-[#64748b] hover:text-[#3b82f6]">
                        <Upload className="h-4 w-4" />
                        {uploadingFiles ? "Uploading..." : "Click to upload files"}
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                          disabled={uploadingFiles}
                          accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                      </label>
                      {pendingFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {pendingFiles.map((file, i) => (
                            <div key={`p-${i}`} className="flex items-center justify-between bg-[#fffbeb] p-2 rounded border border-[#fde68a]">
                              <div className="flex items-center gap-2">
                                {file.type.startsWith("image/") ? (
                                  <ImageIcon className="h-4 w-4 text-[#d97706]" />
                                ) : (
                                  <FileText className="h-4 w-4 text-[#92400e]" />
                                )}
                                <span className="text-sm text-[#92400e] truncate max-w-[250px]">{file.name}</span>
                                <span className="text-xs text-[#b45309]">({formatFileSize(file.size)})</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-[#dc2626] hover:text-[#dc2626]"
                                onClick={() => removePendingFile(i)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {formData.attachments.map((url, i) => (
                            <div key={i} className="flex items-center justify-between bg-[#f8fafc] p-2 rounded">
                              <div className="flex items-center gap-2">
                                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <ImageIcon className="h-4 w-4 text-[#3b82f6]" />
                                ) : (
                                  <FileText className="h-4 w-4 text-[#64748b]" />
                                )}
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3b82f6] hover:underline truncate max-w-[250px]">
                                  {url.split("/").pop()}
                                </a>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-[#dc2626] hover:text-[#dc2626]"
                                onClick={() => removeExistingAttachment(i)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                    <Link href="/support" className="w-full">
                      <Button type="button" variant="outline" disabled={loading} className="w-full">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading || uploadingFiles} className="w-full sm:w-auto">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {uploadingFiles ? "Uploading files..." : "Submitting..."}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
