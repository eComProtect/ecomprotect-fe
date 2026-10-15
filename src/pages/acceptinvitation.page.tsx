import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authClient } from "@/providers/user.provider";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const email = searchParams.get("email");
    const otp = searchParams.get("otp");

    if (!otp || !email) {
      setStatus("error");
      setErrorMessage("No verification token found. The link may be invalid.");
      return;
    }

    const verifyToken = async () => {
      // better-auth's client resolves { data, error } instead of throwing by
      // default — a try/catch here would never see a failed verification
      // (expired/invalid OTP) and would always report "success".
      const { error } = await authClient.emailOtp.verifyEmail({ email, otp });

      if (error) {
        setStatus("error");
        setErrorMessage(
          error.message || "Verification failed. The link may have expired."
        );
        return;
      }

      setStatus("success");
    };

    verifyToken();
  }, [searchParams]);

  return (
    <Box className="h-[100vh]">
      <Box className="p-8 bg-white shadow rounded-md ">
        {status === "verifying" && (
          <>
            <h1>Verifying your email...</h1>
            <Spinner size="xl" color="teal.500" />
            <p>Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="blue.500">Email Verified!</h1>
            <p>Your account is now active.</p>

            <Link to={"/signin"}>Proceed to Login</Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 color="red.500">Verification Failed</h1>
            <p>{errorMessage}</p>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AcceptInvitation;
