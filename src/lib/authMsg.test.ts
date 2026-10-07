import { expect, it } from "vitest";
import { authMessage } from "./authMsg";
it("explains the errors a person can fix", () => {
  expect(authMessage("Invalid login credentials")).toMatch(/no password yet/);
  expect(authMessage("User already registered")).toMatch(/already has an account/);
  expect(authMessage("Email not confirmed")).toMatch(/not confirmed/);
  expect(authMessage("email rate limit exceeded")).toMatch(/Wait a minute/);
  expect(authMessage("Something odd")).toBe("Something odd");
});
