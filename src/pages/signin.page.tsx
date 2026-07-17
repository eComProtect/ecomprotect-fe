import SiginImage from "/images/sigin_page.png";
import logo from "/images/logo.png";
import { Link } from "react-router-dom";
import { SigninForm } from "../components/authform/signin.form";
import { Box } from "@/components/ui/box";

export const Signin = () => {
  return (
    <Box className="flex h-screen w-full bg-white">
      {/* Left Column: Contains logo, form, and footer */}
      <Box className="flex w-full flex-col p-10 lg:w-4/5">
        <Box>
          <Link to={"/"}>
            <img src={logo} alt="eComProtect Logo" className="h-14" />
          </Link>
        </Box>
        <Box className="flex flex-grow items-center justify-center">
          <Box className="w-full max-w-md">
            <SigninForm />
          </Box>
        </Box>

        {/* Bottom: Footer */}
        <footer className="w-full">
          <Box className="flex items-center justify-between text-sm max-sm:flex-col max-sm:items-start max-sm:text-xs text-gray-500">
            <p>© {new Date().getFullYear()} eComProtect. All rights reserved.</p>
            <Box className="space-x-6 max-sm:text-xs">
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link to="" className="hover:underline">
                Terms of Service
              </Link>
            </Box>
          </Box>
        </footer>
      </Box>

      <Box className="hidden items-center justify-center bg-white p-2 lg:flex lg:w-3/5">
        <img
          src={SiginImage}
          alt="A seamless way to manage your profile"
          className="h-full w-full "
        />
      </Box>
    </Box>
  );
};
