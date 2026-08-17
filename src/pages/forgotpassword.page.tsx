import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";
import { authClient } from "@/providers/user.provider";
import logo from "/images/logo.png";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate

// --- Zod Schema for Validation ---
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export const ForgotPasswordForm = () => {
  const navigate = useNavigate(); // <-- Initialize useNavigate
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // On success, navigate to a confirmation page
      navigate("/check-email");
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Main Render ---
  return (
    <Flex className="min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Box className="w-full max-w-md">
        {/* Logo */}
        <Flex className="mb-8 justify-center">
          <img src={logo} alt="eComProtect Logo" className="h-12 w-auto" />
        </Flex>

        {/* Form Card */}
        <Box className="rounded-xl bg-white p-8 shadow-lg">
          <Box className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Forgot Your Password?
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              No problem. Enter your email below and we'll send you a link to
              reset it.
            </p>
          </Box>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        {...field}
                        className="rounded-lg border-gray-300 py-6 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full bg-blue-600 py-6 text-base text-white hover:bg-blue-700"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        </Box>
      </Box>
    </Flex>
  );
};
