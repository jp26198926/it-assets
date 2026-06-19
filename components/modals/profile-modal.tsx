"use client";

import { useState, useRef, useEffect } from "react";
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
import { Camera, Loader2, X } from "lucide-react";
import {
  updateMyProfile,
  requestEmailChange,
  verifyEmailChange,
  requestPhoneChange,
  verifyPhoneChange,
  uploadProfilePhoto,
} from "@/lib/actions/auth-actions";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/types/auth";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
}

export function ProfileModal({
  open,
  onOpenChange,
  user,
  onUserUpdate,
}: ProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [newPhone, setNewPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && open) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setCurrentEmail(user.email);
      setCurrentPhone(user.phone || "");
      setAvatarUrl(null);
      setNewEmail("");
      setEmailOtp("");
      setShowEmailOtp(false);
      setEmailVerified(false);
      setNewPhone("");
      setPhoneOtp("");
      setShowPhoneOtp(false);
      setPhoneVerified(false);
      setErrors({});
    }
  }, [user, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (newEmail && newEmail !== currentEmail && !emailVerified) {
      newErrors.newEmail = "Please verify your new email first";
    }
    if (newPhone && newPhone !== currentPhone && !phoneVerified) {
      newErrors.newPhone = "Please verify your new phone number first";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const result = await uploadProfilePhoto(base64, file.name);
        if (result.success && result.url) {
          setAvatarUrl(result.url);
          toast.success("Photo uploaded successfully");
        } else {
          toast.error(result.error || "Failed to upload photo");
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload photo");
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendEmailOtp = async () => {
    if (!newEmail) {
      setErrors({ newEmail: "Please enter a new email" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setErrors({ newEmail: "Please enter a valid email" });
      return;
    }
    if (newEmail === currentEmail) {
      setErrors({ newEmail: "New email must be different from current email" });
      return;
    }

    setSendingEmailOtp(true);
    setErrors({});
    try {
      const result = await requestEmailChange(newEmail);
      if (result.success) {
        setShowEmailOtp(true);
        setEmailVerified(false);
        setEmailOtp("");
        toast.success(result.message || "Verification code sent to your new email");
      } else {
        toast.error(result.error || "Failed to send verification code");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setErrors({ emailOtp: "Please enter the 6-digit code" });
      return;
    }

    setVerifyingEmail(true);
    setErrors({});
    try {
      const result = await verifyEmailChange(emailOtp, newEmail);
      if (result.success) {
        setEmailVerified(true);
        setShowEmailOtp(false);
        setCurrentEmail(newEmail);
        setNewEmail("");
        setEmailOtp("");
        toast.success("Email verified successfully");
      } else {
        toast.error(result.error || "Failed to verify email");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!newPhone) {
      setErrors({ newPhone: "Please enter a new phone number" });
      return;
    }
    if (newPhone.length < 10) {
      setErrors({ newPhone: "Please enter a valid phone number" });
      return;
    }
    if (newPhone === currentPhone) {
      setErrors({ newPhone: "New phone must be different from current phone" });
      return;
    }

    setSendingPhoneOtp(true);
    setErrors({});
    try {
      const result = await requestPhoneChange(newPhone);
      if (result.success) {
        setShowPhoneOtp(true);
        setPhoneVerified(false);
        setPhoneOtp("");
        toast.success(result.message || "Verification code sent to your phone");
      } else {
        toast.error(result.error || "Failed to send verification code");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      setErrors({ phoneOtp: "Please enter the 6-digit code" });
      return;
    }

    setVerifyingPhone(true);
    setErrors({});
    try {
      const result = await verifyPhoneChange(phoneOtp, newPhone);
      if (result.success) {
        setPhoneVerified(true);
        setShowPhoneOtp(false);
        setCurrentPhone(newPhone);
        setNewPhone("");
        setPhoneOtp("");
        toast.success("Phone number verified successfully");
      } else {
        toast.error(result.error || "Failed to verify phone");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await updateMyProfile({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
      });

      if (result.success && result.user) {
        onUserUpdate(result.user);
        toast.success("Profile updated successfully");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-fit max-h-[85vh] overflow-y-auto max-w-[90vw] sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            View and update your profile information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {avatarUrl ? (
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#e2e8f0]"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1 -right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {uploadingPhoto ? (
                    <Loader2 className="size-8 animate-spin" />
                  ) : (
                    getInitials()
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 size-8 bg-[#3b82f6] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#2563eb] transition-colors disabled:opacity-50"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-[#64748b]">Click camera icon to upload photo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={currentEmail}
              disabled
              className="bg-[#f0f4f8]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">Change Email</Label>
            <div className="flex gap-2">
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailVerified(false);
                  setShowEmailOtp(false);
                  setErrors({});
                }}
                placeholder="Enter new email"
                disabled={emailVerified}
                className={`flex-1 ${errors.newEmail ? "border-red-500" : ""} ${emailVerified ? "bg-[#f0f4f8] line-through decoration-[#64748b]" : ""}`}
              />
              {!emailVerified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendEmailOtp}
                  disabled={sendingEmailOtp || !newEmail}
                  className="shrink-0"
                >
                  {sendingEmailOtp ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Send Code"
                  )}
                </Button>
              )}
            </div>
            {errors.newEmail && (
              <p className="text-xs text-red-500">{errors.newEmail}</p>
            )}
            {emailVerified && (
              <p className="text-xs text-green-600">Email verified</p>
            )}
          </div>

          {showEmailOtp && (
            <div className="space-y-2">
              <Label>Enter Verification Code</Label>
              <p className="text-xs text-[#64748b]">
                Enter the 6-digit code sent to <strong>{newEmail}</strong>
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setEmailOtp(val);
                    setErrors({});
                  }}
                  placeholder="000000"
                  className={`flex-1 text-center text-lg tracking-widest ${errors.emailOtp ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={verifyingEmail || emailOtp.length !== 6}
                  className="shrink-0"
                >
                  {verifyingEmail ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              {errors.emailOtp && (
                <p className="text-xs text-red-500">{errors.emailOtp}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPhone">Phone Number</Label>
            <Input
              id="currentPhone"
              type="tel"
              value={currentPhone}
              disabled
              className="bg-[#f0f4f8]"
              placeholder="No phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPhone">Change Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="newPhone"
                type="tel"
                value={newPhone}
                onChange={(e) => {
                  setNewPhone(e.target.value);
                  setPhoneVerified(false);
                  setShowPhoneOtp(false);
                  setErrors({});
                }}
                placeholder="Enter new phone number"
                disabled={phoneVerified}
                className={`flex-1 ${errors.newPhone ? "border-red-500" : ""} ${phoneVerified ? "bg-[#f0f4f8] line-through decoration-[#64748b]" : ""}`}
              />
              {!phoneVerified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendPhoneOtp}
                  disabled={sendingPhoneOtp || !newPhone}
                  className="shrink-0"
                >
                  {sendingPhoneOtp ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Send Code"
                  )}
                </Button>
              )}
            </div>
            {errors.newPhone && (
              <p className="text-xs text-red-500">{errors.newPhone}</p>
            )}
            {phoneVerified && (
              <p className="text-xs text-green-600">Phone number verified</p>
            )}
          </div>

          {showPhoneOtp && (
            <div className="space-y-2">
              <Label>Enter Verification Code</Label>
              <p className="text-xs text-[#64748b]">
                Enter the 6-digit code sent to <strong>{newPhone}</strong>
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={phoneOtp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPhoneOtp(val);
                    setErrors({});
                  }}
                  placeholder="000000"
                  className={`flex-1 text-center text-lg tracking-widest ${errors.phoneOtp ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={verifyingPhone || phoneOtp.length !== 6}
                  className="shrink-0"
                >
                  {verifyingPhone ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              {errors.phoneOtp && (
                <p className="text-xs text-red-500">{errors.phoneOtp}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || verifyingEmail || verifyingPhone}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}