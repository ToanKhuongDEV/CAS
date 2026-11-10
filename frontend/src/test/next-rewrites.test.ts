import { afterEach, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

afterEach(() => vi.unstubAllEnvs());

it("proxies only versioned backend APIs when a backend URL is configured", async () => {
  vi.stubEnv("BACKEND_URL", "https://backend.example.com/");
  expect(await nextConfig.rewrites?.()).toEqual([
    {
      source: "/api/v1/:path*",
      destination: "https://backend.example.com/api/v1/:path*",
    },
  ]);

  vi.stubEnv("BACKEND_URL", "");
  expect(await nextConfig.rewrites?.()).toEqual([]);
});
