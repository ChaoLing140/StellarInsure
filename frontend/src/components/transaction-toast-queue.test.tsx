import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  TransactionToastQueueProvider,
  useToastQueue,
} from "./transaction-toast-queue";

function Trigger({ message, status }: { message: string; status: "pending" | "success" | "failure" }) {
  const { enqueue } = useToastQueue();
  return (
    <button onClick={() => enqueue(message, status)}>
      Add {status}
    </button>
  );
}

function renderWithProvider(...triggers: Array<{ message: string; status: "pending" | "success" | "failure" }>) {
  return render(
    <TransactionToastQueueProvider>
      {triggers.map((t, i) => (
        <Trigger key={i} message={t.message} status={t.status} />
      ))}
    </TransactionToastQueueProvider>
  );
}

describe("TransactionToastQueue", () => {
  it("renders toasts in enqueue order", () => {
    renderWithProvider(
      { message: "First tx", status: "pending" },
      { message: "Second tx", status: "success" }
    );

    fireEvent.click(screen.getByText("Add pending"));
    fireEvent.click(screen.getByText("Add success"));

    const toasts = screen.getAllByRole("status");
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent("First tx");
    expect(toasts[1]).toHaveTextContent("Second tx");
  });

  it("dismisses a toast when the dismiss button is clicked", () => {
    renderWithProvider({ message: "Dismiss me", status: "success" });

    fireEvent.click(screen.getByText("Add success"));
    expect(screen.getByText(/Dismiss me/)).toBeInTheDocument();

    const dismissBtn = screen.getByRole("button", { name: /Dismiss notification: Dismiss me/ });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/Dismiss me/)).not.toBeInTheDocument();
  });

  it("dismiss button is keyboard accessible (has accessible label)", () => {
    renderWithProvider({ message: "Keyboard test", status: "failure" });

    fireEvent.click(screen.getByText("Add failure"));

    const dismissBtn = screen.getByRole("button", { name: /Dismiss notification: Keyboard test/ });
    expect(dismissBtn).toBeInTheDocument();
    // Simulate keyboard activation
    fireEvent.keyDown(dismissBtn, { key: "Enter" });
    fireEvent.click(dismissBtn);
    expect(screen.queryByText(/Keyboard test/)).not.toBeInTheDocument();
  });

  it("shows visually distinct status labels", () => {
    renderWithProvider(
      { message: "Pending tx", status: "pending" },
      { message: "Success tx", status: "success" },
      { message: "Failed tx", status: "failure" }
    );

    fireEvent.click(screen.getByText("Add pending"));
    fireEvent.click(screen.getByText("Add success"));
    fireEvent.click(screen.getByText("Add failure"));

    const toasts = screen.getAllByRole("status");
    expect(toasts[0]).toHaveAttribute("data-status", "pending");
    expect(toasts[1]).toHaveAttribute("data-status", "success");
    expect(toasts[2]).toHaveAttribute("data-status", "failure");

    expect(toasts[0]).toHaveTextContent("[Pending]");
    expect(toasts[1]).toHaveTextContent("[Success]");
    expect(toasts[2]).toHaveTextContent("[Failed]");
  });

  it("auto-dismisses success and failure toasts after timeout", async () => {
    vi.useFakeTimers();
    renderWithProvider({ message: "Auto dismiss", status: "success" });

    fireEvent.click(screen.getByText("Add success"));
    expect(screen.getByText(/Auto dismiss/)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(5001);
    });

    expect(screen.queryByText(/Auto dismiss/)).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not auto-dismiss pending toasts", async () => {
    vi.useFakeTimers();
    renderWithProvider({ message: "Pending stays", status: "pending" });

    fireEvent.click(screen.getByText("Add pending"));

    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/Pending stays/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("announces toasts with aria-live polite", () => {
    renderWithProvider({ message: "Aria test", status: "success" });
    fireEvent.click(screen.getByText("Add success"));

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("aria-atomic", "true");
  });

  it("throws when useToastQueue is used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function BadComponent() {
      useToastQueue();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      "useToastQueue must be used within TransactionToastQueueProvider"
    );
    spy.mockRestore();
  });
});
