import "../setup";
import { describe, expect, it } from "bun:test";
import { home } from "@app/routes/home";

describe("Home Routes", () => {
  const app = home;

  describe("GET /home", () => {
    it("should return hello message", async () => {
      const response = await app.handle(new Request("http://localhost/home"));

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe("Hello Elysia");
    });
  });

  describe("POST /home", () => {
    it("should return success response with person data", async () => {
      const response = await app.handle(
        new Request("http://localhost/home", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "John" }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({
        success: true,
        data: { name: "John" },
      });
    });

    it("should return 422 for invalid body", async () => {
      const response = await app.handle(
        new Request("http://localhost/home", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
      );

      expect(response.status).toBe(422);
    });

    it("should return 422 for empty name", async () => {
      const response = await app.handle(
        new Request("http://localhost/home", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "" }),
        })
      );

      expect(response.status).toBe(422);
    });
  });
});
