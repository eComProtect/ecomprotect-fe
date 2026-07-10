import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { shop, host } from "@/configs/appbridge.config";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "/images/logo.png";

const MIN_PASSWORD_LENGTH = 8;

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  companyName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/**
 * Profile-completion step for the embedded onboarding flow. Reached when
 * GET /api/onboarding/status reports "needs_signup" — the store's placeholder
 * row already exists (created at OAuth install with real Shopify credentials),
 * it just still has a placeholder name/email until this form runs.
 */
const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.companyName ||
      !form.email ||
      !form.password
    ) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = form;
      await axios.post("/onboarding/signup", payload);
      // Re-run the root gate: onboardingStatus is now "signed_up", so it
      // routes to billing next. Must rebuild shop/host explicitly —
      // EmbeddedEntry decides "am I embedded?" from the URL's query string,
      // and by this point react-router's own in-app navigation (EmbeddedEntry
      // -> here) has already stripped it from window.location. shop/host
      // from appbridge.config are captured once at true page load, so they're
      // still correct regardless of what the URL bar currently shows.
      const params = new URLSearchParams({ shop, host });
      navigate(`/?${params.toString()}`, { replace: true });
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to save your details."
      );
      setSubmitting(false);
    }
  };

  return (
    <Flex className="mx-auto max-w-xl flex-col p-8">
      <Box className="mb-6 w-32">
        <img src={logo} alt="eComProtect" />
      </Box>
      <Box className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#141414]">
          Tell us about your business
        </h1>
        <p className="mt-2 text-gray-600">
          A few details before you set up billing.
        </p>
      </Box>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Box>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={form.firstName}
              onChange={update("firstName")}
              className="mt-1 border-gray-200 bg-gray-50 py-5"
            />
          </Box>
          <Box>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={update("lastName")}
              className="mt-1 border-gray-200 bg-gray-50 py-5"
            />
          </Box>
        </Box>

        <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Box>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={update("email")}
              className="mt-1 border-gray-200 bg-gray-50 py-5"
            />
          </Box>
          <Box>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+447123456789"
              value={form.phone}
              onChange={update("phone")}
              className="mt-1 border-gray-200 bg-gray-50 py-5"
            />
          </Box>
        </Box>

        <Box>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder="Your Company Ltd"
            value={form.companyName}
            onChange={update("companyName")}
            className="mt-1 border-gray-200 bg-gray-50 py-5"
          />
        </Box>

        <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Box>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={update("password")}
                className="border-gray-200 bg-gray-50 py-5 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </Box>
          <Box>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                className="border-gray-200 bg-gray-50 py-5 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </Box>
        </Box>

        <p className="text-xs text-gray-500">
          You'll use this email and password to sign in outside of Shopify Admin.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-blue-600 py-6 text-white hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Continue"}
        </Button>
      </form>
    </Flex>
  );
};

export default CompleteProfilePage;
