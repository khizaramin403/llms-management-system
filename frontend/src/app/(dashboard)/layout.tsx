import { AuthGate } from "@/features/auth/components/AuthGate";

/**
 * Minimal temporary dashboard layout.
 * Wraps children with AuthGate to ensure only authenticated sessions can view dashboard routes.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
