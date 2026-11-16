"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { ROLES } from "@/constants/roles";

export default function LabsPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <PageHeader
        title="Labs"
        description="Manage laboratory tenants and their administrators"
      />
    </RoleGuard>
  );
}
