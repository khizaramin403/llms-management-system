"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { ROLES } from "@/constants/roles";

export default function StaffPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.LAB_ADMIN]}>
      <PageHeader
        title="Staff"
        description="Manage doctors and receptionists for your laboratory"
      />
    </RoleGuard>
  );
}
