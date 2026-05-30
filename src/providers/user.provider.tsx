import {
  type FC,
  useState,
  useEffect,
  useContext,
  createContext,
  type PropsWithChildren,
} from "react";
import { createAuthClient, type BetterFetchError } from "better-auth/react";
import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { backendOrigin } from "../configs/axios.config";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        company_name: {
          type: "string",
        },
        mobile_number: {
          type: "string",
        },
        company_registration_number: {
          type: "string",
        },
        average_orders_per_month: {
          type: "string",
        },
        shopify_api_key: {
          type: "string",
          required: false,
        },
        shopify_access_token: {
          type: "string",
          required: false,
        },
        shopify_url: {
          type: "string",
        },
        role: { type: "string" },
        plan: { type: "string" },
        package: { type: "string" },
      },
    }),
    phoneNumberClient(),
    emailOTPClient(),
  ],
  baseURL: backendOrigin,
});

type SessionObject = typeof authClient.$Infer.Session;

type Data = {
  user: SessionObject["user"];
  session: SessionObject["session"];
};

interface ContextData {
  refetchUser: () => void;
  isLoading: boolean;
  data: Data | null;
}

interface BeterAuthProviderProps extends PropsWithChildren {
  refetchOnError?: boolean;

  onError?: (error: BetterFetchError) => void;
}

const UserAuthContext = createContext<ContextData>({} as any);

export const UserProvider: FC<BeterAuthProviderProps> = ({
  onError,
  children,
  refetchOnError = false,
}) => {
  const { data: authData, isPending, error, refetch } = authClient.useSession();
  const [data, setData] = useState<ContextData["data"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refetchUser = refetch;

  useEffect(() => {
    if (isPending) {
      setIsLoading(true);
      return;
    }
    if (authData?.user && authData?.session) {
      setData(authData as Data);
      setIsLoading(false);
    } else {
      setData(null);
      setIsLoading(false);
    }
    if (error) {
      onError?.(error);
      if (refetchOnError) {
        setTimeout(() => {
          refetchUser();
        }, 1000);
      }
    }
  }, [authData, isPending, error, onError, refetchOnError]);

  return (
    <UserAuthContext.Provider
      value={{
        data,
        isLoading,
        refetchUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("userUser must be used within a UserProvider");
  }
  return context;
};
