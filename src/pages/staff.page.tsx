import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box } from "@/components/ui/box";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { authClient } from "@/providers/user.provider";
import {
  Eye,
  EyeOff,
  RefreshCw,
  UserPlus,
  Wand2,
  ShieldCheck,
  User,
  Users,
  Pencil,
} from "lucide-react";
import { useFetchStaff, type StaffMember } from "@/hooks/staff/usefetchstaff";
import { useUpdateStaff } from "@/hooks/staff/useupdatestaff";

const STAFF_MANAGER_ROLES = ["owner", "subadmin", "manager"];

const ROLE_LABELS: Record<string, string> = {
  manager: "Manager",
  support: "Support",
  subadmin: "Sub-Admin",
  marketing: "Marketing",
};

function EditStaffDialog({
  staff,
  onClose,
}: {
  staff: StaffMember;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: staff.name,
    mobile_number: staff.mobile_number ?? "",
    role: staff.role,
    banned: Boolean(staff.banned),
  });
  const { mutate, isPending } = useUpdateStaff();

  const handleSave = () => {
    mutate(
      { id: staff.id, ...form },
      {
        onSuccess: onClose,
      }
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Edit {staff.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 border-slate-200 bg-slate-50/50 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Phone Number
            </label>
            <Input
              value={form.mobile_number}
              onChange={(e) =>
                setForm({ ...form, mobile_number: e.target.value })
              }
              className="h-11 border-slate-200 bg-slate-50/50 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Assigned Role
            </label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm({ ...form, role: value })}
            >
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-lg shadow-none">
                <SelectValue placeholder="Select staff role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Active</p>
              <p className="text-xs text-slate-500">
                Deactivating blocks this staff member from signing in.
              </p>
            </div>
            <Switch
              checked={!form.banned}
              onCheckedChange={(checked) =>
                setForm({ ...form, banned: !checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StaffList() {
  const { data: staff, isLoading, error } = useFetchStaff();
  const [editing, setEditing] = useState<StaffMember | null>(null);

  return (
    <Box className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden mt-6">
      <header className="flex items-center gap-3 py-6 px-8 border-b border-slate-100">
        <Box className="p-2 bg-blue-50 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </Box>
        <Box>
          <h2 className="text-xl font-semibold text-slate-800">
            Team Members
          </h2>
          <p className="text-sm text-slate-500">
            View and manage the staff on your store.
          </p>
        </Box>
      </header>

      <CardContent className="p-0">
        {isLoading ? (
          <p className="p-8 text-sm text-slate-500">Loading staff...</p>
        ) : error ? (
          <p className="p-8 text-sm text-red-600">Failed to load staff.</p>
        ) : !staff || staff.length === 0 ? (
          <p className="p-8 text-sm text-slate-500">
            No staff members yet — create one above.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-8 py-3">Name</th>
                <th className="text-left font-semibold px-4 py-3">Email</th>
                <th className="text-left font-semibold px-4 py-3">Phone</th>
                <th className="text-left font-semibold px-4 py-3">Role</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-8 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id}>
                  <td className="px-8 py-3 font-medium text-slate-800">
                    {member.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{member.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {member.mobile_number || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {member.banned ? (
                      <Badge variant="destructive">Inactive</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-transparent">
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-8 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(member)}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>

      {editing && (
        <EditStaffDialog staff={editing} onClose={() => setEditing(null)} />
      )}
    </Box>
  );
}

export default function CreateStaff() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "support",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  if (
    session?.user?.role &&
    !STAFF_MANAGER_ROLES.includes(session.user.role)
  ) {
    return (
      <Box className="rounded-xl bg-white shadow-sm border border-slate-200 p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-800">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Only store owners and managers can view or manage staff.
        </p>
      </Box>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setForm({ ...form, password: retVal });
    setShowPassword(true);
    toast.success("Random password generated");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await authClient.admin.createUser(
        {
          name: form.name,
          email: form.email,
          password: form.password,
          data: {
            role: form.role,
            mobile_number: form.phone,
            // Staff always point back at the actual store-owner row, even when
            // created by an existing staff member (never at the creator's own id).
            storeOwnerId: session?.user?.storeOwnerId ?? session?.user?.id,
            shopify_url: session?.user?.shopify_url,
            average_orders_per_month: session?.user?.average_orders_per_month,
            shopify_api_key: session?.user?.shopify_api_key,
            shopify_access_token: session?.user?.shopify_access_token,
            package: session?.user?.package,
            plan: session?.user?.plan,
            company_name: session?.user?.company_name,
            company_registration_number: session?.user?.company_registration_number,
          },
        },
        {
          onSuccess: async () => {
            toast.success("Staff member created successfully");
            await authClient.emailOtp.sendVerificationOtp({
              email: form.email,
              type: "email-verification",
            });
            setForm({ name: "", email: "", password: "", phone: "", role: "support" });
            queryClient.invalidateQueries({ queryKey: ["staff-list"] });
            setLoading(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <>
    <Box className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      {/* Consistent Header Style */}
      <header className="flex flex-wrap items-center justify-between gap-4 py-6 px-8 border-b border-slate-100">
        <Box className="flex items-center gap-3">
          <Box className="p-2 bg-blue-50 rounded-lg">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </Box>
          <Box>
            <h1 className="text-2xl font-semibold text-slate-800">
                Create New Staff
            </h1>
            <p className="text-sm text-slate-500">
                Fill in the details below to add a new team member to your store.
            </p>
          </Box>
        </Box>
      </header>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" /> Personnel Information
                </h3>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                        Full Name
                    </label>
                    <Input
                        type="text"
                        name="name"
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={handleChange}
                        className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 rounded-lg transition-all"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                        Email Address
                    </label>
                    <Input
                        type="email"
                        name="email"
                        placeholder="john.doe@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 rounded-lg transition-all"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                        Phone Number
                    </label>
                    <Input
                        type="tel"
                        name="phone"
                        placeholder="+44 7700 900000"
                        value={form.phone}
                        onChange={handleChange}
                        className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 rounded-lg transition-all"
                    />
                </div>
            </div>

            {/* Right Column: Security & Role */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Access & Security
                </h3>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                        Account Password
                        <button
                            type="button"
                            onClick={generatePassword}
                            className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors bg-blue-50 px-2 py-0.5 rounded"
                        >
                            <Wand2 className="h-3 w-3" />
                            Generate Secure
                        </button>
                    </label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={handleChange}
                            className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 rounded-lg pr-12 transition-all font-mono"
                            required
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-blue-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                        Assigned Role
                    </label>
                    <Select
                        value={form.role}
                        onValueChange={(value) => setForm({ ...form, role: value })}
                    >
                        <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 rounded-lg transition-all shadow-none">
                            <SelectValue placeholder="Select staff role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                            <SelectItem value="manager" className="cursor-pointer">Manager</SelectItem>
                            <SelectItem value="support" className="cursor-pointer">Support</SelectItem>
                            <SelectItem value="marketing" className="cursor-pointer">Marketing</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          <Box className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between gap-4">
            <Box className="flex items-center gap-2 text-slate-400 text-xs italic">
                <RefreshCw className="h-3 w-3" />
                Staff member must verify their email before logging in.
            </Box>
            <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 rounded-lg font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                disabled={loading}
            >
              {loading ? (
                <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> 
                    Creating Account...
                </>
              ) : (
                <>
                    <UserPlus className="h-4 w-4" /> 
                    Confirm & Create Staff
                </>
              )}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Box>
    <StaffList />
    </>
  );
}
