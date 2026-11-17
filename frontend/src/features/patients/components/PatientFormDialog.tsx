"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePatient, useUpdatePatient } from "../hooks";
import {
  createPatientSchema,
  type CreatePatientFormValues,
} from "../schemas";
import type { Patient, Gender } from "../types";
import { ApiError } from "@/types/api";

export interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSuccess?: (patient: Patient) => void;
}

interface PatientFormContentProps {
  patient?: Patient | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patient: Patient) => void;
}

function PatientFormContent({
  patient,
  onOpenChange,
  onSuccess,
}: PatientFormContentProps) {
  const isEditing = Boolean(patient);
  const [serverError, setServerError] = useState<string | null>(null);

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();

  const isPending =
    createPatientMutation.isPending || updatePatientMutation.isPending;

  // Max selectable date for Date of Birth is today
  const todayDateString = new Date().toISOString().split("T")[0];

  const dobFormatted = patient?.dateOfBirth
    ? patient.dateOfBirth.slice(0, 10)
    : "";

  const form = useForm<CreatePatientFormValues>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      name: patient?.name || "",
      phone: patient?.phone || "",
      gender: patient?.gender || "MALE",
      dateOfBirth: dobFormatted,
      address: patient?.address || "",
    },
  });

  const onSubmit = (values: CreatePatientFormValues) => {
    setServerError(null);

    const payload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      gender: values.gender as Gender,
      dateOfBirth: values.dateOfBirth,
      address: values.address?.trim() ? values.address.trim() : undefined,
    };

    if (isEditing && patient) {
      updatePatientMutation.mutate(
        { id: patient.id, data: payload },
        {
          onSuccess: (updatedPatient) => {
            toast.success(`Patient "${updatedPatient.name}" updated successfully`);
            onOpenChange(false);
            onSuccess?.(updatedPatient);
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    } else {
      createPatientMutation.mutate(payload, {
        onSuccess: (createdPatient) => {
          toast.success(
            `Patient "${createdPatient.name}" registered successfully`
          );
          onOpenChange(false);
          onSuccess?.(createdPatient);
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  const handleError = (error: ApiError) => {
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err) => {
        if (
          err.field &&
          ["name", "phone", "gender", "dateOfBirth", "address"].includes(
            err.field
          )
        ) {
          form.setError(err.field as keyof CreatePatientFormValues, {
            type: "server",
            message: err.message,
          });
        }
      });
    } else if (error.message) {
      setServerError(error.message);
    } else {
      setServerError(
        isEditing ? "Failed to update patient" : "Failed to register patient"
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Patient" : "Register New Patient"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update patient demographic information and contact details."
            : "Register a new patient into the laboratory records."}
        </DialogDescription>
      </DialogHeader>

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Desktop Two-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. John Doe"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g. 03001234567"
                        autoComplete="off"
                        {...field}
                        onChange={(e) => {
                          // Sirf 0 se 9 tak ke digits allow karega
                          const onlyNumbers = e.target.value.replace(/\D/g, "");
                          field.onChange(onlyNumbers);
                        }}
                      />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        max={todayDateString}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address (Optional) */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Address{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Street address, city, region"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="mr-2 size-4" />}
              {isEditing ? "Save Changes" : "Register Patient"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: PatientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {open && (
          <PatientFormContent
            key={patient?.id || "create"}
            patient={patient}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
