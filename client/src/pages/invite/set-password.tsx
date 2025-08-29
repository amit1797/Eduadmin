import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import { routes } from "@/lib/routes";

const schema = z.object({
  password: z.string().min(8, "Minimum 8 characters").regex(/[A-Z]/, "At least one uppercase letter").regex(/[a-z]/, "At least one lowercase letter").regex(/[0-9]/, "At least one number").regex(/[^A-Za-z0-9]/, "At least one special character"),
  confirmPassword: z.string().min(8, "Confirm your password"),
}).refine((vals) => vals.password === vals.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type FormVals = z.infer<typeof schema>;

export default function SetPasswordPage() {
  const [location, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormVals>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (!t) {
      setError("Missing invite token.");
    } else {
      setToken(t);
    }
  }, [location]);

  const onSubmit = async (vals: FormVals) => {
    if (!token) return;
    setError(null);
    try {
      const res = await authApi.setPassword({ token, password: vals.password });
      // AuthService is set inside authApi; redirect to dashboard
      const user = AuthService.getUser();
      const dest = routes.dashboardFor(user ?? undefined);
      navigate(dest || "/");
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || "Failed to set password. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow rounded p-6">
        <h1 className="text-2xl font-semibold mb-2">Set your password</h1>
        <p className="text-sm text-zinc-500 mb-4">Create a password to activate your account.</p>

        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input type="password" className="w-full border rounded px-3 py-2 bg-transparent" {...register("password")} />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input type="password" className="w-full border rounded px-3 py-2 bg-transparent" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button disabled={!token || isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">
            {isSubmitting ? "Setting..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
