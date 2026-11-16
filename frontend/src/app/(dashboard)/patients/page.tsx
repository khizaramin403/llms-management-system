"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { ROLES } from "@/constants/roles";

export default function PatientsPage() {
  return (
    <RoleGuard
      allowedRoles={[ROLES.LAB_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]}
    >
      <PageHeader
        title="Patients"
        description="View and manage registered laboratory patients"
      />
    </RoleGuard>
  );
}
