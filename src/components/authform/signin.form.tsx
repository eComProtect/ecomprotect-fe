import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { isEmbedded } from "@/configs/appbridge.config";
import { setStaffToken } from "@/configs/staffsession";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Eye, EyeOff } from "lucide-react";
import { Flex } from "../ui/flex";
import { Box } from "../ui/box";
import { authClient } from "../../providers/user.provider";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
  email: z.string().trim().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  rememberMe: z.boolean().default(false).optional(),

  authorisation: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms to sign in.",
  }),
});

export const SigninForm = () => {
  const pendingApprovalMessage =
    "Your account is still pending approval. An admin needs to verify it before you can sign in.";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  // 2. Define your form using the updated schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
      authorisation: false,
    },
    mode: "onChange",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: session } = await authClient.getSession();
    const email = values.email.trim();

    await authClient.signIn.email(
      {
        email,
        password: values.password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async (ctx) => {
          console.log("Refreshed session data:", session);
          setLoading(false);

          // Reached via EmbeddedStaffGate (see embeddedstaffgate.tsx): Shopify's
          // App Bridge token can't tell staff members apart, so the token this
          // sign-in just returned is stored and sent as x-staff-token on every
          // request instead, and we return into the embedded app rather than
          // the standalone dashboard.
          if (isEmbedded) {
            const token = (ctx.data as { token?: string } | undefined)?.token;
            if (token) setStaffToken(token);
            // The identity query was already fetched (and cached) as the
            // owner before EmbeddedStaffGate redirected here — without this,
            // useIdentity would keep serving that stale owner data instead of
            // re-fetching /user/me with the new x-staff-token header.
            queryClient.invalidateQueries({ queryKey: ["identity", "me"] });

            const shop = searchParams.get("shop") ?? "";
            const host = searchParams.get("host") ?? "";
            const returnTo =
              searchParams.get("returnTo") || "/user/customer-management";
            const [path, existingQuery] = returnTo.split("?");
            const destParams = new URLSearchParams(existingQuery || "");
            destParams.set("shop", shop);
            destParams.set("host", host);
            navigate(`${path}?${destParams.toString()}`, { replace: true });
            return;
          }

          navigate("/user/customer-management");
        },
        onError: (error) => {
          const apiMessage = error.error.message || "Sign-in failed.";
          const isPendingApproval =
            error.error.status === 403 &&
            apiMessage.toLowerCase().includes("verified users can signin");

          toast.error(isPendingApproval ? pendingApprovalMessage : apiMessage);
          console.error("Sign-in error:", error);
          setLoading(false);
        },
      }
    );
  }

  return (
    <Flex className=" h-full flex-col justify-center">
      <Flex className="flex-col items-center justify-center space-y-6">
        <Box className="w-full max-w-md space-y-4">
          <Box className="space-y-1">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-gray-500 max-sm:text-xs">
              Don't have an account?{" "}
              <Link
                to="/signup" // Link to the signup page
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </Box>
        </Box>

        <Box className="w-full max-w-md space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter you email address"
                        {...field}
                        className="border-0 py-6 rounded-xl max-sm:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwords</FormLabel>
                    <FormControl>
                      <Box className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          // className="py-6 pr-10"
                          className="border-0 py-6 rounded-xl max-sm:text-sm"
                          {...field}
                          rightIcon={
                            <Button
                              type="button"
                              tabIndex={-1}
                              variant="ghost"
                              className="mr-1.5 text-gray-400 hover:bg-transparent"
                              onClick={() => setShowPassword((v) => !v)}
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </Button>
                          }
                        />
                      </Box>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password Section */}
              <Flex className="items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Box className="leading-none">
                        <FormLabel>Remember me</FormLabel>
                      </Box>
                    </FormItem>
                  )}
                />
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Forget password?
                </Link>
              </Flex>
              <Flex className="items-center justify-between">
                <FormField
                  control={form.control}
                  name="authorisation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="authorisation"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel
                          htmlFor="authorisation"
                          className="font-normal leading-4.5 text-web-dark-grey text-xs max-sm:text-[10px] "
                        >
                          Unauthorised access is prohibited. Attempting to log
                          in without proper authorisation may constitute a
                          criminal offence under UK law
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </Flex>
              <Button
                className="w-full cursor-pointer bg-blue-600 py-6 text-base hover:bg-blue-700 text-white"
                type="submit"
                disabled={loading}
              >
                {loading ? <Spinner /> : "Sign In"}
              </Button>
            </form>
          </Form>
        </Box>
      </Flex>
    </Flex>
  );
};
