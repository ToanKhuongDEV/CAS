import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OperationalRouteGuard } from "../components/auth/operational-route-guard";
import { OperationalAccountMenu } from "../components/ui/operational-account-menu";
import { getCurrentOperationalAccount, signOutOperationalUser } from "../lib/auth/operational-auth";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  clear: vi.fn(),
  showToast: vi.fn(),
  tokenListener: null as null | ((user: unknown) => void),
}));
const router = { replace: mocks.replace, refresh: mocks.refresh };

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/settings",
  useRouter: () => router,
}));
vi.mock("firebase/auth", () => ({
  onIdTokenChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    mocks.tokenListener = callback;
    return vi.fn();
  },
  onAuthStateChanged: () => vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ clear: mocks.clear }) }));
vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({}) }));
vi.mock("../lib/auth/operational-auth", () => ({
  clearSelectedAdminStore: vi.fn(),
  getCurrentOperationalAccount: vi.fn(),
  signOutOperationalUser: vi.fn(),
}));
vi.mock("../components/ui/toast-provider", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));

describe("operational logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tokenListener = null;
  });
  afterEach(cleanup);

  it("redirects after signing out without refreshing the current route", async () => {
    vi.mocked(signOutOperationalUser).mockResolvedValue();
    render(<OperationalAccountMenu area="ADMIN" fallbackName="Admin" loginPath="/admin/login" />);

    fireEvent.click(screen.getByRole("button", { name: /Admin/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Đăng xuất" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/admin/login"));
    expect(mocks.clear).toHaveBeenCalledOnce();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("ignores a stale account response after Firebase reports logout", async () => {
    let resolveAccount!: (value: Awaited<ReturnType<typeof getCurrentOperationalAccount>>) => void;
    vi.mocked(getCurrentOperationalAccount).mockReturnValue(
      new Promise((resolve) => {
        resolveAccount = resolve;
      }),
    );
    render(
      <OperationalRouteGuard area="ADMIN">
        <p>Trang quản trị</p>
      </OperationalRouteGuard>,
    );

    act(() => {
      mocks.tokenListener?.({});
    });
    act(() => {
      mocks.tokenListener?.(null);
    });
    await act(async () => {
      resolveAccount({ accountId: 1, storeId: 1, displayName: "Admin", role: "ADMIN" });
    });

    expect(mocks.replace).toHaveBeenCalledWith("/admin/login");
    expect(screen.queryByText("Trang quản trị")).not.toBeInTheDocument();
  });
});
