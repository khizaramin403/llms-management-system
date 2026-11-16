"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { ROLES } from "@/constants/roles";

export default function DashboardPage() {
  return (
    <RoleGuard
      allowedRoles={[
        ROLES.SUPER_ADMIN,
        ROLES.LAB_ADMIN,
        ROLES.DOCTOR,
        ROLES.RECEPTIONIST,
      ]}
    >
      <PageHeader
        title="Dashboard"
        description="Overview and performance statistics"
      />
    </RoleGuard>
  );
}
