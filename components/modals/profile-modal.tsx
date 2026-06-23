"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { Camera, ImagePlus, Loader2, Upload, X } from "lucide-react";
import {
  updateMyProfile,
  requestEmailChange,
  requestPhoneChange,
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
  const photoMenuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");

  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [showEmailOtp, setShowEmailOtp] = useState(false);

  const [showChangePhone, setShowChangePhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && open) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setCurrentEmail(user.email);
      setCurrentPhone(user.phone || "");
      setAvatarUrl(user.avatar_url);
      setShowChangeEmail(false);
      setNewEmail("");
      setEmailOtp("");
      setShowEmailOtp(false);
      setShowChangePhone(false);
      setNewPhone("");
      setPhoneOtp("");
      setShowPhoneOtp(false);
      setErrors({});
      setShowPhotoMenu(false);
      setShowCamera(false);
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
    }
  }, [user, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target as Node)) {
        setShowPhotoMenu(false);
      }
    };
    if (showPhotoMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPhotoMenu]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (showChangeEmail && newEmail) {
      if (newEmail === currentEmail) {
        newErrors.newEmail = "New email must be different from current email";
      } else if (!emailOtp || emailOtp.length !== 6) {
        newErrors.emailOtp = "Please enter the 6-digit verification code";
      }
    }
    if (showChangePhone && newPhone) {
      if (newPhone === currentPhone) {
        newErrors.newPhone = "New phone must be different from current phone";
      } else if (!phoneOtp || phoneOtp.length !== 6) {
        newErrors.phoneOtp = "Please enter the 6-digit verification code";
      }
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

  const handleOpenCamera = async () => {
    setShowPhotoMenu(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      setShowCamera(true);
      onOpenChange(false);
    } catch {
      toast.error("Unable to access camera. Please check your permissions.");
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    onOpenChange(true);
  };

  const handleCapturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setUploadingPhoto(true);
      handleCloseCamera();

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          const result = await uploadProfilePhoto(base64, "camera-photo.jpg");
          if (result.success && result.url) {
            setAvatarUrl(result.url);
            toast.success("Photo captured successfully");
          } else {
            toast.error(result.error || "Failed to upload photo");
          }
          setUploadingPhoto(false);
        };
        reader.readAsDataURL(blob);
      } catch {
        toast.error("Failed to upload photo");
        setUploadingPhoto(false);
      }
    }, "image/jpeg", 0.9);
  };

  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

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
        setEmailOtp("");
        toast.success(
          result.message || "Verification code sent to your new email",
        );
      } else {
        toast.error(result.error || "Failed to send verification code");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSendingEmailOtp(false);
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

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await updateMyProfile({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        email: showChangeEmail && newEmail ? newEmail : undefined,
        email_otp: showChangeEmail && emailOtp ? emailOtp : undefined,
        phone: showChangePhone && newPhone ? newPhone : undefined,
        phone_otp: showChangePhone && phoneOtp ? phoneOtp : undefined,
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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-fit flex flex-col max-h-[85vh] max-w-[90vw] sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4">
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            View and update your profile information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 flex-1 overflow-y-auto min-h-0">
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
              <div className="relative" ref={photoMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 size-8 bg-[#3b82f6] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#2563eb] transition-colors disabled:opacity-50"
                >
                  <Camera className="size-4" />
                </button>
                {showPhotoMenu && (
                  <div className="absolute bottom-10 right-0 bg-white border border-[#e2e8f0] rounded-lg shadow-lg py-1 z-50 w-44">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowPhotoMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1a1f36] hover:bg-[#f0f4f8] transition-colors"
                    >
                      <Upload className="size-4" />
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCamera}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1a1f36] hover:bg-[#f0f4f8] transition-colors"
                    >
                      <ImagePlus className="size-4" />
                      Take Photo
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-[#64748b]">
              Click camera icon to change photo
            </p>
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
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={currentEmail}
                disabled
                className="bg-[#f0f4f8]"
              />
              {!showChangeEmail && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangeEmail(true)}
                  className="shrink-0"
                >
                  Change
                </Button>
              )}
            </div>
          </div>

          {showChangeEmail && (
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <div className="flex gap-2">
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setShowEmailOtp(false);
                    setEmailOtp("");
                    setErrors({});
                  }}
                  placeholder="Enter new email"
                  className={`flex-1 ${errors.newEmail ? "border-red-500" : ""}`}
                />
                {!showEmailOtp && (
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
            </div>
          )}

          {showEmailOtp && (
            <div className="space-y-2">
              <Label>Enter Verification Code</Label>
              <p className="text-xs text-[#64748b]">
                Enter the 6-digit code sent to <strong>{newEmail}</strong>
              </p>
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
                className={`text-center text-lg tracking-widest ${errors.emailOtp ? "border-red-500" : ""}`}
              />
              {errors.emailOtp && (
                <p className="text-xs text-red-500">{errors.emailOtp}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPhone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="currentPhone"
                type="tel"
                value={currentPhone}
                disabled
                className="bg-[#f0f4f8]"
                placeholder="No phone number"
              />
              {!showChangePhone && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangePhone(true)}
                  className="shrink-0"
                >
                  Change
                </Button>
              )}
            </div>
          </div>

          {showChangePhone && (
            <div className="space-y-2">
              <Label htmlFor="newPhone">New Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="newPhone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => {
                    setNewPhone(e.target.value);
                    setShowPhoneOtp(false);
                    setPhoneOtp("");
                    setErrors({});
                  }}
                  placeholder="Enter new phone number"
                  className={`flex-1 ${errors.newPhone ? "border-red-500" : ""}`}
                />
                {!showPhoneOtp && (
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
            </div>
          )}

          {showPhoneOtp && (
            <div className="space-y-2">
              <Label>Enter Verification Code</Label>
              <p className="text-xs text-[#64748b]">
                Enter the 6-digit code sent to <strong>{newPhone}</strong>
              </p>
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
                className={`text-center text-lg tracking-widest ${errors.phoneOtp ? "border-red-500" : ""}`}
              />
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
            disabled={loading}
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

    {showCamera && createPortal(
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={handleCloseCamera}
          className="absolute top-4 right-4 size-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="size-5" />
        </button>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="max-w-full max-h-[70vh] rounded-lg mirror"
          style={{ transform: "scaleX(-1)" }}
        />
        <button
          type="button"
          onClick={handleCapturePhoto}
          className="mt-6 size-16 bg-white rounded-full border-4 border-white/50 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <div className="size-12 bg-white rounded-full border-2 border-gray-300" />
        </button>
      </div>,
      document.body
    )}
    </>
  );
}
