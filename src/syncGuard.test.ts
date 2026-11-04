import { expect, it } from "vitest";
import { decideSync } from "./syncGuard";
const A = { "ff.goals": [{ id: "warframe:rhino-prime" }] }, B = { "ff.goals": [{ id: "warframe:ash-prime" }] };
it("guest data (no owner) keeps the old behaviour", () => {
  expect(decideSync({ uid: "u1", owner: null, local: A, cloud: null })).toBe("push-local");
  expect(decideSync({ uid: "u1", owner: null, local: {}, cloud: A })).toBe("apply-cloud");
  expect(decideSync({ uid: "u1", owner: null, local: A, cloud: A })).toBe("noop");
  expect(decideSync({ uid: "u1", owner: null, local: A, cloud: B })).toBe("conflict");
  expect(decideSync({ uid: "u1", owner: null, local: {}, cloud: {} })).toBe("noop");
});
it("same account signing in again keeps the old behaviour", () => {
  expect(decideSync({ uid: "u1", owner: "u1", local: A, cloud: B })).toBe("conflict");
  expect(decideSync({ uid: "u1", owner: "u1", local: A, cloud: null })).toBe("push-local");
});
it("another account's data is never uploaded to the new account", () => {
  expect(decideSync({ uid: "u2", owner: "u1", local: A, cloud: null })).toBe("drop-foreign-local");
  expect(decideSync({ uid: "u2", owner: "u1", local: A, cloud: {} })).toBe("drop-foreign-local");
  expect(decideSync({ uid: "u2", owner: "u1", local: A, cloud: B })).toBe("replace-foreign-with-cloud");
});
it("an empty device has nothing foreign to protect", () => {
  expect(decideSync({ uid: "u2", owner: "u1", local: {}, cloud: B })).toBe("apply-cloud");
  expect(decideSync({ uid: "u2", owner: "u1", local: {}, cloud: null })).toBe("noop");
});
