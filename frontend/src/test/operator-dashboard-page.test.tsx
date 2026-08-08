import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatorDashboardPage from "../app/(operator)/operator/(workspace)/dashboard/page";

describe("OperatorDashboardPage", () => {
	it("renders the operator work queues", () => {
		render(<OperatorDashboardPage />);

		expect(screen.getByRole("heading", { name: "Tổng quan" })).toBeInTheDocument();
		expect(screen.getByText("Lượt gọi món hôm nay")).toBeInTheDocument();
		expect(screen.getByText("Bàn đang phục vụ")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Cảnh báo bàn chờ lâu" })).toBeInTheDocument();
		expect(screen.getByText(/Thời gian được tính từ lúc bàn bắt đầu chờ món/i)).toBeInTheDocument();
		expect(screen.getByText(/Ngưỡng cảnh báo hiện tại:/)).toHaveTextContent("25 phút");
		expect(screen.getByText("Đã chờ 25 phút")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Khiếu nại" })).toBeInTheDocument();
		expect(screen.getByText("3 phản ánh")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Mở đơn của Bàn 05" })).toHaveAttribute("href", "/operator/orders/ORD-0821");
		expect(screen.getByText("Bàn 02").closest("a")).toBeNull();
		expect(screen.getAllByText("Đang hoạt động")).toHaveLength(2);
		expect(screen.getAllByText("Trống")).toHaveLength(2);
		expect(screen.getByText("● Đang hoạt động")).toBeInTheDocument();
		expect(screen.getByText("○ Trống")).toBeInTheDocument();
		expect(screen.queryByText("Cần chú ý")).not.toBeInTheDocument();
		expect(screen.queryByText(/ORD-/)).not.toBeInTheDocument();
		expect(screen.queryByText(/FIFO/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/lâu nhất/i)).not.toBeInTheDocument();
		expect(screen.queryByRole("heading", { name: "Hoạt động gần đây" })).not.toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Sơ đồ bàn mini" })).toBeInTheDocument();
		expect(screen.getAllByText("Bàn 05").length).toBeGreaterThan(0);

		const complaintButton = screen.getByRole("button", {
			name: "Xem khiếu nại của Bàn 12",
		});
		expect(within(complaintButton).getByText(/Khách phản ánh món mang ra còn thiếu/)).toHaveClass("line-clamp-2");

		fireEvent.click(complaintButton);

		const complaintDialog = screen.getByRole("dialog", {
			name: "Chi tiết khiếu nại",
		});
		expect(within(complaintDialog).getByText(/muốn nhân viên kiểm tra lại toàn bộ món trên bàn/i)).toBeInTheDocument();

		fireEvent.click(
			within(complaintDialog).getByRole("button", {
				name: "Đóng chi tiết khiếu nại",
			}),
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.queryByText(/Dữ liệu hiện tại là dữ liệu mẫu/)).not.toBeInTheDocument();
		expect(screen.queryByText(/tiền mặt/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/đợi món quá lâu/i)).not.toBeInTheDocument();
	});

	it("allows reporting operational incidents from the dashboard", () => {
		render(<OperatorDashboardPage />);

		expect(screen.getByRole("heading", { name: "Sự cố phát sinh" })).toBeInTheDocument();
		expect(screen.getByText("2 sự cố")).toBeInTheDocument();

		const reportButton = screen.getByRole("button", { name: "Báo cáo sự cố" });
		fireEvent.click(reportButton);

		const dialog = screen.getByRole("dialog", { name: "Báo cáo sự cố phát sinh" });
		expect(dialog).toBeInTheDocument();

		const textarea = screen.getByPlaceholderText("Nhập nội dung sự cố phát sinh trong ca...");
		fireEvent.change(textarea, { target: { value: "Bếp hết gia vị sốt cay đột xuất" } });

		const submitBtn = screen.getByRole("button", { name: "Gửi báo cáo" });
		fireEvent.click(submitBtn);

		expect(screen.getByText("Đã ghi nhận báo cáo sự cố thành công.")).toBeInTheDocument();
		expect(screen.getByText("Bếp hết gia vị sốt cay đột xuất")).toBeInTheDocument();
		expect(screen.getByText("3 sự cố")).toBeInTheDocument();
	});
});
