import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { ShieldCheck, BarChart2, Briefcase, Loader2 } from "lucide-react";
import { axios } from "../configs/axios.config";
import { authClient } from "../providers/user.provider";
import underreview from "/images/bg_profile (1).png";
import logo from "/images/logo.png";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";

/** Shape returned by GET /api/billing/plans (see plansForMerchant). */
type ApiPlan = {
  name: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  available: boolean;
};

const PLAN_ICONS: Record<string, typeof BarChart2> = {
  "ECP Insight": BarChart2,
  "ECP Vision": ShieldCheck,
  "ECP Shield": Briefcase,
};

const PackageSelectionComponent = ({
  onSelectPackage,
}: {
  onSelectPackage: (pkg: { name: string; price: number; currency: string }) => void;
}) => {
  // Session is still awaited before rendering prices: /billing/plans is behind
  // protectRoute and resolves the tier from the merchant's own row, so there's
  // nothing to read off the session object here any more.
  const { isPending: sessionPending } = authClient.useSession();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Pricing is owned by the backend's BILLING_PLANS matrix and served by
  // GET /api/billing/plans, already resolved for this merchant's order tier.
  // It used to be duplicated here as a hardcoded price-per-tier ladder, which
  // drifted from the Shopify billing prices and let the browser choose its own price.
  const { data: plans, isLoading: plansLoading } = useQuery<ApiPlan[]>({
    queryKey: ["billing", "plans"],
    // Body is { message, data: BillingPlan[] } — the plan array is under `data`.
    queryFn: async () => (await axios.get("/billing/plans")).data?.data ?? [],
  });

  // Icons are presentation-only, so they stay client-side, keyed by plan name.
  const packages = (plans ?? []).map((plan) => ({
    ...plan,
    icon: PLAN_ICONS[plan.name] ?? BarChart2,
  }));

  const isPending = sessionPending || plansLoading;

  // Set the default selected package once data is loaded
  useEffect(() => {
    if (!isPending && packages.length > 0) {
      const firstAvailablePackage = packages.find((p) => p.available);
      setSelectedPackage(firstAvailablePackage);
    }
  }, [isPending, plans]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading your packages...</p>
      </div>
    );
  }

  return (
    <Flex className="flex-col mx-auto p-12">
      <Box className="w-32 mb-5">
        <img src={logo} alt="" />
      </Box>
      <Box className="w-full max-w-6xl mx-auto">
        <Box className="text-center mb-12">
          <h1 className="text-5xl max-sm:text-3xl text-[#141414] font-bold">
            Pricing that scales with your growth
          </h1>
          <p className="text-gray-600 mt-2 max-sm:text-sm">
            Unlimited users. Transparent pricing based on meaningful shopper
            conversations, not seats.
          </p>
        </Box>

        <Box className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Package List */}
          <Box className="w-full md:w-1/3 flex flex-col gap-10">
            {packages.map((pkg) => (
              <button
                key={pkg.name}
                onClick={() => pkg.available && setSelectedPackage(pkg)}
                disabled={!pkg.available}
                className={`text-left p-4 rounded-lg h-32 border-0 transition-all duration-300 ${
                  selectedPackage?.name === pkg.name
                    ? "bg-gray-900 text-white shadow-lg"
                    : "bg-white hover:bg-gray-50"
                } ${!pkg.available ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <Box className="flex justify-between items-center">
                  <Box>
                    <h2 className="text-lg font-bold">{pkg.name}</h2>
                    <p className="text-sm">{pkg.description}</p>
                  </Box>
                  <Box className="text-right">
                    <p className="text-lg font-semibold">
                      from €{pkg.price}/mo
                    </p>
                  </Box>
                </Box>
              </button>
            ))}
          </Box>

          {/* Right Column: Selected Package Details */}
          <Box className="w-full border-0 md:w-2/3 bg-white p-8 rounded-lg shadow-sm">
            {selectedPackage ? (
              <Box>
                <Box className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {selectedPackage.name}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Centralize customer conversations and empower your team.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      €{selectedPackage.price}
                      <span className="text-base font-normal text-gray-500">
                        /mo
                      </span>
                    </p>
                  </div>
                </Box>

                <Box className="border-t border-gray-200 my-6"></Box>

                <Box className="space-y-4">
                  <h3 className="text-xl font-semibold">What's included</h3>
                  <ul className="space-y-4 gap-4">
                    {selectedPackage.features.map((feature: string) => (
                      <li key={feature} className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Box>

                <Box className="border-t border-gray-200 my-6"></Box>

                <Box className="flex justify-end mt-8">
                  <Button
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() =>
                      onSelectPackage({
                        name: selectedPackage.name,
                        price: selectedPackage.price,
                        currency: selectedPackage.currency,
                      })
                    }
                    disabled={!selectedPackage.available}
                  >
                    Proceed to Payment
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box className="text-center py-12">
                <p>Please select a package to see the details.</p>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

const PaymentComponent = () => (
  <div className="flex flex-col justify-center mx-auto items-center border-0 text-center space-y-6 p-10">
    <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
    <h1 className="text-3xl font-bold">Setting Up Your Account</h1>
    <p className="text-gray-600">
      Please wait while we redirect you to install the app on your Shopify store.
    </p>
  </div>
);

const EnterpriseReviewComponent = () => {
  const location = useLocation();
  const { userEmail } = location.state || {};

  useEffect(() => {
    const setupEnterpriseUser = async () => {
      if (userEmail) {
        try {
          const updatedUser = await authClient.updateUser({
            plan: "Enterprise",
          });

          console.log("This is the updated user:", updatedUser);

          if (updatedUser.data?.status === true) {
            await authClient.sendVerificationEmail({
              email: userEmail,
            });
          }
        } catch (error) {
          console.error("Failed to update user for enterprise review:", error);
        }
      }
    };

    setupEnterpriseUser();
  }, [userEmail]);

  return (
    <div className="flex flex-col items-center justify-items-center mx-auto justify-center text-center space-y-6 p-10">
      <img src={underreview} alt="underreview" className="w-1/3" />

      <h1 className="text-3xl font-bold">Thank You for Your Application</h1>
      <p className="text-gray-600 text-lg max-w-lg">
        An eComProtect Account Manager will be in touch within 24 hours.
      </p>
      <Link to="/" className="mt-4">
        <Button variant="outline">Back to Homepage</Button>
      </Link>
    </div>
  );
};

export const PostSignupFlowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const { flowStep, userId, userEmail } = location.state || {};
  const [currentStep, setCurrentStep] = useState(flowStep);

  useEffect(() => {
    if (!userId) {
      navigate("/signup");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      setCurrentStep("underReview");
    }
  }, [userId, navigate]);

  const handlePackageSelect = async (pkg: {
    name: string;
    price: number;
    currency: string;
  }) => {
    setIsLoading(true);
    setCurrentStep("payment");

    try {
      // Billing now happens exclusively through the Shopify Billing API once
      // the merchant installs the app on their store — there is no off-Shopify
      // payment path any more. Record the chosen package, then send them to
      // install; the Shopify OAuth flow triggers the actual subscription charge.
      const updatedUser = await authClient.updateUser({
        plan: String(pkg.price),
        package: pkg.name,
      });

      if (updatedUser.data?.status === true) {
        await authClient.sendVerificationEmail({
          email: userEmail,
        });
      }
      navigate("/install");
    } catch (error) {
      console.error("Package selection failed:", error);
      setIsLoading(false);
      setCurrentStep("packageSelection"); // Revert to selection on failure
    }
  };

  const renderStep = () => {
    if (isLoading && currentStep === "payment") {
      return <PaymentComponent />;
    }
    switch (currentStep) {
      case "packageSelection":
        return (
          <PackageSelectionComponent onSelectPackage={handlePackageSelect} />
        );
      case "underReview":
        return <p>Redirecting to under review</p>;
      case "enterpriseReview":
        return <EnterpriseReviewComponent />;
      default:
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />;
    }
  };

  useEffect(() => {
    if (currentStep === "underReview") {
      navigate("/under-review");
    }
  }, [currentStep, navigate]);

  return (
    <div className="flex items-center min-h-screen bg-gradient-to-b to-gray-100 from-blue-100">
      {renderStep()}
    </div>
  );
};
