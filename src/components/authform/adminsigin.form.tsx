import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { authClient } from "@/providers/user.provider";
import toast from "react-hot-toast";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  rememberMe: z.boolean().default(false).optional(),
});

// How long to wait for the session store to carry the new session before
// treating the sign-in as failed rather than leaving the form spinning.
const SESSION_WAIT_TIMEOUT_MS = 5000;

export const AdminSigninForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);

  const { data: session, refetch } = authClient.useSession();

  const navigate = useNavigate();

  // The sign-in response sets the cookie, but the shared better-auth session
  // store that ProtectedRoute/AdminProtectedRoute read is only revalidated
  // asynchronously afterwards — and UserProvider keeps that store mounted for
  // the whole app, so until it revalidates it still holds the resolved
  // "no session" snapshot from this page. Navigating straight out of onSuccess
  // races that revalidation: whichever lands first decides whether the guards
  // see the session or bounce back here, which is why the redirect only worked
  // some of the time. So wait for the store to actually carry the session
  // before leaving.
  useEffect(() => {
    if (!signedIn) return;

    if (session?.user) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (sessionTimedOut) {
      setSignedIn(false);
      setSessionTimedOut(false);
      setAuthChecked(false);
      toast.error("Could not start your session. Please sign in again.");
      return;
    }

    const timer = setTimeout(
      () => setSessionTimedOut(true),
      SESSION_WAIT_TIMEOUT_MS
    );
    return () => clearTimeout(timer);
  }, [signedIn, session, sessionTimedOut, navigate]);

  // 2. Define your form using the updated schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // 3. Define a submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      },
      {
        onRequest: () => {
          setAuthChecked(true);
        },
        onSuccess: () => {
          toast.success("Signed in successfully!");
          // Kick the shared session store now instead of relying on
          // better-auth's own post-sign-in revalidation to land first; the
          // effect above does the actual redirect once it carries the session.
          // authChecked stays true so the button keeps its spinner until then.
          setSignedIn(true);
          refetch();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setAuthChecked(false);
        },
      }
    );
  };

  return (
    <Flex className=" h-full flex-col justify-center">
      {/* Removed padding from here to be controlled by the parent page */}
      <Flex className="flex-col items-center justify-center space-y-6">
        <Box className="w-full space-y-4">
          <Box className="space-y-1">
            <h1 className="text-3xl font-bold">Welcome Back!</h1>
            <p>Enter your credential to access your account!</p>
          </Box>
        </Box>

        <Box className="w-full space-y-6">
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
                        className="border-0 py-6 rounded-xl"
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
                          className="border-0 py-6 rounded-xl"
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
              <Flex className="items-center justify-between"></Flex>
              <Button
                className="w-full bg-blue-600 py-6 cursor-pointer text-base hover:bg-blue-700 text-white"
                type="submit"
                disabled={authChecked}
              >
                {authChecked ? <Spinner /> : "Sign In"}
              </Button>
            </form>
          </Form>
        </Box>
      </Flex>
    </Flex>
  );
};
