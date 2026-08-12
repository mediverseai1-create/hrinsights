import { z } from "zod";

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Enter the employee's full name"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  department: z.string().min(1, "Select a department"),
  roleTitle: z.string().optional().or(z.literal("")),
  shiftStart: z.string().min(1, "Select a shift start time"),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export const csvRowSchema = z.object({
  full_name: z.string().min(2, "Missing full name"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  department: z.string().min(1, "Missing department"),
  role_title: z.string().optional().or(z.literal("")),
  shift_start: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Shift start must be HH:MM")
    .optional()
    .or(z.literal("")),
});

export type CsvRow = z.infer<typeof csvRowSchema>;
