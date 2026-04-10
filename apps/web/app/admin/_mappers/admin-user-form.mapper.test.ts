import assert from "node:assert/strict";
import test from "node:test";

import {
  createInitialCreateUserFormValues,
  toCreateAdminUserInput,
} from "./admin-user-form.mapper";

test("creates a clean initial create-user form state", () => {
  assert.deepEqual(createInitialCreateUserFormValues(), {
    name: "",
    email: "",
    password: "",
  });
});

test("normalizes name and email before building the create-user payload", () => {
  assert.deepEqual(
    toCreateAdminUserInput({
      name: "  Maria Silva  ",
      email: "  Maria.Silva@Email.COM ",
      password: "Secret123",
    }),
    {
      name: "Maria Silva",
      email: "maria.silva@email.com",
      password: "Secret123",
    },
  );
});
