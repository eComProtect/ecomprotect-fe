import { Link } from "react-router-dom";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

export const CheckEmailPage = () => {
  return (
    <Flex className="min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Box className="w-full max-w-md">
        <Flex className="mb-8 justify-center">
          <Link to="/">
            <img
              src="/images/logo.png"
              alt="eComProtect Logo"
              className="h-12 w-auto"
            />
          </Link>
        </Flex>

        <Box className="rounded-xl bg-white p-8 text-center shadow-lg">
          <Flex className="mb-4 justify-center">
            <Box className="rounded-full bg-blue-50 p-3">
              <MailCheck className="h-8 w-8 text-blue-600" />
            </Box>
          </Flex>
          <h1 className="text-2xl font-bold text-gray-900">
            Check Your Email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            If an account exists for that email address, we've sent a link to
            reset your password. Please check your inbox and spam folder.
          </p>

          <Link to="/admin-signin">
            <Button className="mt-6 w-full bg-blue-600 py-6 text-base text-white hover:bg-blue-700">
              Back to Sign In
            </Button>
          </Link>
        </Box>
      </Box>
    </Flex>
  );
};

export default CheckEmailPage;
