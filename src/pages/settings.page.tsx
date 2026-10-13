import { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Library } from "lucide-react";
import { authClient } from "@/providers/user.provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stack } from "@/components/ui/stack";
import logoIcon from "/icons/logo_icon.png";
import { useUploadProfileImage } from "@/hooks/users/useupdateprofilepic";

const FormMessage = ({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) => {
  if (!message) return null;
  const colors =
    type === "error" ? "text-red-600 bg-red-50" : "text-green-700 bg-green-50";
  return (
    <div className={`p-3 rounded-md text-sm font-medium ${colors}`}>
      {message}
    </div>
  );
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;

  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null;
  company_name?: string | null;
  mobile_number?: string | null;
  company_registration_number?: string | null;
  average_orders_per_month?: string | null;
  plan?: string | null;
  package?: string | null;
  shopify_api_key?: string | null;
  shopify_access_token?: string | null;
  shopify_url?: string | null;

  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
};

export const Settings = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // State for password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for UI feedback (loading, errors, etc.)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State to toggle password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useUploadProfileImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  const { data } = authClient.useSession();

  const user = data?.user;

  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = user.name.split(" ");
      setFormData({
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    let imageUrl: string | undefined;
    if (selectedFile) {
      const resp = await uploadMutation.mutateAsync(selectedFile);
      imageUrl = resp.url;
    }

    if (imageUrl) {
      await authClient.updateUser({
        image: imageUrl,
      });
    }

    if (
      passwordData.newPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setError("New passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const updatePayload: {
        name: string;
        currentPassword?: string;
        password?: string;
      } = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      if (passwordData.newPassword) {
        updatePayload.currentPassword = passwordData.currentPassword;
        updatePayload.password = passwordData.newPassword;
      }

      await authClient.updateUser(updatePayload);

      let emailChangeMessage = "";
      if (user && formData.email.trim() !== user.email) {
        const { error: emailError } = await authClient.changeEmail({
          newEmail: formData.email.trim(),
          callbackURL: `${window.location.origin}/admin/settings`,
        });

        if (emailError) {
          throw new Error(emailError.message || "Failed to update email.");
        }

        emailChangeMessage = user.emailVerified
          ? " Check your current inbox to confirm the new email address."
          : " Check your new inbox to verify it.";
      }

      setSuccess(
        `Your settings have been saved successfully!${emailChangeMessage}`
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="bg-white rounded-2xl">
      {/* The form now wraps the entire settings area */}
      <form onSubmit={handleSubmit}>
        <Box className="mx-auto max-sm:mx-0">
          <header className="flex justify-between items-center mb-8 px-5 pt-10 max-sm:flex-col max-sm:items-start max-sm:gap-y-4">
            <h1 className="text-3xl font-bold text-web-dark-grey">Settings</h1>
            <Button
              type="submit"
              className="bg-blue-600 text-white py-5 px-6 rounded-lg hover:bg-blue-700 min-w-[150px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </header>

          {/* Display Success/Error messages at the top */}
          <Box className="px-5 mb-4">
            <FormMessage type="success" message={success!} />
            <FormMessage type="error" message={error!} />
          </Box>

          <Card className="border-none shadow-none w-full md:w-[80%]">
            <CardContent className="p-0">
              <div className="space-y-6 px-5">
                <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6">
                  <Avatar className="h-28 w-28  bg-blue-600">
                    <AvatarImage
                      src={preview || data?.user.image || logoIcon}
                      className="object-cover"
                      alt="Company Logo"
                    />
                    <AvatarFallback>
                      <Library className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <Stack>
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-md text-sm font-medium flex items-center"
                    >
                      Choose File
                    </Label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      onClick={handleRemove}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
                <Separator />
                <Box className="space-y-6 pt-2">
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Box className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleNameChange}
                        className="py-5 rounded-lg border-gray-200 bg-gray-50"
                      />
                    </Box>
                    <Box className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleNameChange}
                        className="py-5 rounded-lg border-gray-200 bg-gray-50"
                      />
                    </Box>
                  </Box>
                  <Box className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleNameChange}
                      disabled={!user}
                      className="py-5 rounded-lg border-gray-200 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Changing your email requires confirming the change from
                      your current inbox.
                    </p>
                  </Box>
                </Box>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* --- PASSWORD & SECURITY SECTION --- */}
          <Card className="border-none shadow-none px-5 w-full md:w-[80%]">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-bold text-gray-800">
                Password & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <Box className="bg-gray-50 p-4 w-full lg:w-3/5 rounded-lg border border-gray-200">
                <p className="text-sm">
                  Your password must be at least 6 characters and should include
                  a combination of numbers, letters and special characters
                  (!$@%).
                </p>
              </Box>
              <Box className="space-y-4">
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="py-5 rounded-lg border-gray-200 bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="py-5 rounded-lg border-gray-200 bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="py-5 rounded-lg border-gray-200 bg-gray-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </form>
    </Box>
  );
};
