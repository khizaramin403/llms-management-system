"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { ROLES } from "@/constants/roles";

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
      <PageHeader
        title="Users"
        description="Manage system user accounts and platform access"
      />
    </RoleGuard>
  );
}
