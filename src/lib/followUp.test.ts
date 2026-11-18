import { describe, expect, it } from "vitest";
import { followUp } from "./followUp";
describe("followUp", () => {
  it("puts the previous subject where an English pronoun was", () => {
    expect(followUp("and where do I get it?", "ash prime")).toEqual({ query: "where do i get ash prime", used: true });
    expect(followUp("how do I farm that", "orokin cell")).toEqual({ query: "how do i farm orokin cell", used: true });
    expect(followUp("what does it do", "serration")).toEqual({ query: "what does serration do", used: true });
  });
  it("does the same in Spanish, with demonstratives and with lo/la only after a question word", () => {
    expect(followUp("¿y dónde lo consigo?", "ash prime")).toEqual({ query: "donde ash prime consigo", used: true });
    expect(followUp("como farmeo eso", "endo")).toEqual({ query: "como farmeo endo", used: true });
    expect(followUp("la historia de rhino", "ash prime")).toEqual({ query: "la historia de rhino", used: false });
  });
  it("leaves complete questions, long ones, and questions with no previous subject alone", () => {
    expect(followUp("where do i farm orokin cell", "ash prime").used).toBe(false);
    expect(followUp("where do i get it", null)).toEqual({ query: "where do i get it", used: false });
    expect(followUp("and where can i possibly find it if i have never played this game before at all", "x").used).toBe(false);
    expect(followUp("   ", "x").used).toBe(false);
  });
});
