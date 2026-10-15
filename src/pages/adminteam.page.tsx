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

const PLATFORM_ADMIN_ROLES = ["admin", "it_support", "project_manager"] as const;

const PLATFORM_ROLE_LABELS: Record<string, string> = {
  admin: "Platform Admin",
  it_support: "IT Support",
  project_manager: "Project Manager",
};

function EditAdminDialog({
  admin,
  onClose,
}: {
  admin: StaffMember;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: admin.name,
    email: admin.email,
    mobile_number: admin.mobile_number ?? "",
    role: admin.role,
    banned: Boolean(admin.banned),
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const { mutate, isPending } = useUpdateStaff();

  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setNewPassword(retVal);
    setShowPassword(true);
    toast.success("Random password generated");
  };

  const handleSave = async () => {
    if (newPassword) {
      if (newPassword.length < 8) {
        toast.error("New password must be at least 8 characters.");
        return;
      }

      setResettingPassword(true);
      const { error } = await authClient.admin.setUserPassword({
        userId: admin.id,
        newPassword,
      });
      setResettingPassword(false);

      if (error) {
        toast.error(error.message || "Failed to reset password.");
        return;
      }

      toast.success("Password reset successfully");
      setNewPassword("");
    }

    const emailChanged = form.email.trim().toLowerCase() !== admin.email.toLowerCase();

    mutate(
      { id: admin.id, ...form },
      {
        onSuccess: async () => {
          if (emailChanged) {
            await authClient.emailOtp.sendVerificationOtp({
              email: form.email,
              type: "email-verification",
            });
            toast.success("Verification email sent to the new address");
          }
          onClose();
        },
      }
    );
  };

  const saving = isPending || resettingPassword;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Edit {admin.name}</DialogTitle>
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
              Email Address
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-11 border-slate-200 bg-slate-50/50 rounded-lg"
            />
            <p className="text-xs text-slate-500">
              Changing the email requires the admin to verify it again before
              signing in.
            </p>
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
                <SelectValue placeholder="Select admin role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                {PLATFORM_ADMIN_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {PLATFORM_ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              New Password
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
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 border-slate-200 bg-slate-50/50 rounded-lg pr-12 font-mono"
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

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Active</p>
              <p className="text-xs text-slate-500">
                Deactivating blocks this admin from signing in.
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
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminTeamList() {
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
            Platform Admins
          </h2>
          <p className="text-sm text-slate-500">
            View and manage the admin team for this platform.
          </p>
        </Box>
      </header>

      <CardContent className="p-0">
        {isLoading ? (
          <p className="p-8 text-sm text-slate-500">Loading admin team...</p>
        ) : error ? (
          <p className="p-8 text-sm text-red-600">Failed to load admin team.</p>
        ) : !staff || staff.length === 0 ? (
          <p className="p-8 text-sm text-slate-500">
            No platform admins yet — create one above.
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
                      {PLATFORM_ROLE_LABELS[member.role] ?? member.role}
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
        <EditAdminDialog admin={editing} onClose={() => setEditing(null)} />
      )}
    </Box>
  );
}

export default function CreatePlatformAdmin() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "admin" as string,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
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
            // Platform admins aren't scoped to a store, but /api/staff keys its
            // roster lookup off storeOwnerId, so this points admin-team rows
            // back at the superadmin who created them — mirroring how a store
            // owner's staff point back at the owner's own id.
            storeOwnerId: session?.user?.storeOwnerId ?? session?.user?.id,
          },
        },
        {
          onSuccess: async () => {
            toast.success("Platform admin created successfully");
            await authClient.emailOtp.sendVerificationOtp({
              email: form.email,
              type: "email-verification",
            });
            setForm({ name: "", email: "", password: "", phone: "", role: "admin" });
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
        <header className="flex flex-wrap items-center justify-between gap-4 py-6 px-8 border-b border-slate-100">
          <Box className="flex items-center gap-3">
            <Box className="p-2 bg-blue-50 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </Box>
            <Box>
              <h1 className="text-2xl font-semibold text-slate-800">
                Create Platform Admin
              </h1>
              <p className="text-sm text-slate-500">
                Add a new admin to help manage stores, customers and reports
                across the platform.
              </p>
            </Box>
          </Box>
        </header>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
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
                      <SelectValue placeholder="Select admin role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-xl rounded-lg">
                      {PLATFORM_ADMIN_ROLES.map((role) => (
                        <SelectItem key={role} value={role} className="cursor-pointer">
                          {PLATFORM_ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Box className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between gap-4">
              <Box className="flex items-center gap-2 text-slate-400 text-xs italic">
                <RefreshCw className="h-3 w-3" />
                Admin must verify their email before logging in.
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
                    Confirm & Create Admin
                  </>
                )}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Box>
      <AdminTeamList />
    </>
  );
}
