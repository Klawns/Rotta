import { type CreateAdminUserInput } from "@/types/admin";

export interface CreateUserFormValues {
  name: string;
  email: string;
  password: string;
}

export function createInitialCreateUserFormValues(): CreateUserFormValues {
  return {
    name: "",
    email: "",
    password: "",
  };
}

export function toCreateAdminUserInput(
  form: CreateUserFormValues,
): CreateAdminUserInput {
  return {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
  };
}
