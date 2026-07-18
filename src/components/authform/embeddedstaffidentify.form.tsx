import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/providers/user.provider";
import { setStaffToken } from "@/configs/staffsession";

const formSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

/**
 * Shown once per embedded browser session before a merchant's dashboard
 * renders. Shopify's App Bridge session token only identifies the shop, not
 * which eComProtect staff account is looking at it — this form lets a staff
 * member prove their own identity (same credentials as the standalone site),
 * or the store owner can skip it entirely since the shop-level resolution
 * already correctly resolves to them without a password.
 */
export function EmbeddedStaffIdentifyForm({
  onIdentified,
}: {
  onIdentified: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await authClient.signIn.email(
      {
        email: values.email.trim(),
        password: values.password,
      },
      {
        onSuccess: async (ctx) => {
          const token = (ctx.data as { token?: string } | undefined)?.token;
          if (!token) {
            toast.error("Sign-in succeeded but no session token was returned.");
            setLoading(false);
            return;
          }
          setStaffToken(token);
          setLoading(false);
          onIdentified();
        },
        onError: (error) => {
          toast.error(error.error.message || "Sign-in failed.");
          setLoading(false);
        },
      }
    );
  }

  return (
    <Flex className="h-full min-h-[70vh] flex-col items-center justify-center">
      <Box className="w-full max-w-sm space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Box className="flex flex-col items-center gap-2 text-center">
          <Box className="rounded-lg bg-blue-50 p-2">
            <UserCog className="h-6 w-6 text-blue-600" />
          </Box>
          <h1 className="text-xl font-semibold text-slate-800">Who's using this?</h1>
          <p className="text-sm text-slate-500">
            Sign in with your own eComProtect account so your team's activity is
            tracked correctly.
          </p>
        </Box>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} className="h-11" />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Box className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-11 pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </Box>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Sign In"}
            </Button>
          </form>
        </Form>
      </Box>
    </Flex>
  );
}
