"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Upload, X, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadTicketAttachment } from "@/lib/actions/ticket-actions";
import type { Ticket, CreateTicketInput } from "@/lib/types/ticket";

interface TicketFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
  onSubmit: (data: CreateTicketInput) => Promise<void>;
  selectOptions: {
    categories: { id: string; name: string }[];
    assets: { id: string; barcode: string; itemName: string }[];
    users: { id: string; name: string }[];
  };
  currentUser?: { firstName: string; lastName: string; email: string } | null;
}

const defaultFormData: CreateTicketInput = {
  name: "",
  email: "",
  title: "",
  description: "",
  category_id: "",
  priority: "Low",
  asset_id: "",
  assigned_to: "",
  attachments: [],
};

export function TicketFormModal({
  open,
  onOpenChange,
  ticket,
  onSubmit,
  selectOptions,
  currentUser,
}: TicketFormModalProps) {
  const [formData, setFormData] = useState<CreateTicketInput>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData({
        name: ticket.name,
        email: ticket.email,
        title: ticket.title,
        description: ticket.description,
        category_id: ticket.category_id,
        priority: ticket.priority,
        asset_id: ticket.asset_id || "",
        assigned_to: ticket.assigned_to || "",
        attachments: ticket.attachments || [],
      });
    } else if (currentUser) {
      setFormData({
        ...defaultFormData,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        email: currentUser.email,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [ticket, open, currentUser]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const newAttachments = [...(formData.attachments || [])];

      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const result = await uploadTicketAttachment(base64, file.name);
        if (result.success && result.url) {
          newAttachments.push(result.url);
        } else {
          toast.error(result.error || "Failed to upload file");
        }
      }

      setFormData({ ...formData, attachments: newAttachments });
      toast.success("Files uploaded successfully");
    } catch {
      toast.error("Failed to upload files");
    } finally {
      setUploadingFiles(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = (formData.attachments || []).filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const handleRichTextImageUpload = async (file: File): Promise<string | null> => {
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await uploadTicketAttachment(base64, file.name);
      if (result.success && result.url) {
        return result.url;
      }
      toast.error(result.error || "Failed to upload image");
      return null;
    } catch {
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          ...formData,
          asset_id: formData.asset_id || undefined,
          assigned_to: formData.assigned_to || undefined,
        });
        onOpenChange(false);
      } catch {
        setErrors({ submit: "Failed to save ticket" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl sm:max-w-4xl flex flex-col max-h-[85vh]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>{ticket ? "Edit Ticket" : "Create New Ticket"}</DialogTitle>
          <DialogDescription>
            {ticket
              ? "Update the ticket information below."
              : "Fill in the details to create a new support ticket."}
          </DialogDescription>
        </DialogHeader>
        <form id="ticket-form" onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
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
              placeholder="Detailed description of the issue... (You can paste images directly here)"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className={`w-full ${errors.category_id ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.categories.map((cat) => (
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
                onValueChange={(value: "Low" | "Medium" | "High" | "Critical") =>
                  setFormData({ ...formData, priority: value })
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Asset (Optional)</Label>
              <Select
                value={formData.asset_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, asset_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {selectOptions.assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.barcode} - {asset.itemName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign To (Optional)</Label>
              <Select
                value={formData.assigned_to || "none"}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value === "none" ? "" : value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {selectOptions.users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#64748b] hover:text-[#3b82f6]">
                  <Upload className="h-4 w-4" />
                  {uploadingFiles ? "Uploading..." : "Click to upload files"}
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFiles}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#f8fafc] p-2 rounded">
                      <div className="flex items-center gap-2">
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <ImageIcon className="h-4 w-4 text-[#3b82f6]" />
                        ) : (
                          <FileText className="h-4 w-4 text-[#64748b]" />
                        )}
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3b82f6] hover:underline truncate max-w-[300px]">
                          {url.split("/").pop()}
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-[#dc2626] hover:text-[#dc2626]"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" form="ticket-form" disabled={loading}>
            {loading ? "Saving..." : ticket ? "Save Changes" : "Create Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
