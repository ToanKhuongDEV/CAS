const capabilities = [
  {
    index: "01",
    title: "Gọi món bằng QR",
    description: "Khách mở đúng bàn, xem menu và gửi nhiều order trong cùng phiên.",
  },
  {
    index: "02",
    title: "Menu linh hoạt",
    description: "Quản lý món, size, topping và giữ nguyên giá tại thời điểm đặt.",
  },
  {
    index: "03",
    title: "Thanh toán rõ ràng",
    description: "Mỗi lần thanh toán có VietQR và nội dung chuyển khoản riêng.",
  },
];

const flow = ["Quét QR", "Chọn món", "Gửi order", "Thanh toán"];

export default function Home() {
  return (
    <main>
      <header className="siteHeader">
        <a className="brand" href="#" aria-label="CAS trang chủ">
          <span className="brandMark">C</span>
          <span>CAS</span>
        </a>
        <div className="systemBadge">
          <span aria-hidden="true" />
          Hệ thống sẵn sàng
        </div>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Gọi món tại bàn, không gián đoạn</p>
          <h1>
            Một trải nghiệm
            <br />
            <em>gọn từ món đến bill.</em>
          </h1>
          <p className="heroDescription">
            CAS kết nối khách hàng và cửa hàng trong một luồng thống nhất:
            gọi món bằng QR, theo dõi order và thanh toán VietQR.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#capabilities">
              Khám phá hệ thống
              <span aria-hidden="true">↗</span>
            </a>
            <span className="timezone">Asia/Ho_Chi_Minh · UTC+07:00</span>
          </div>
        </div>

        <div className="orderCard" aria-label="Minh họa order">
          <div className="orderCardHeader">
            <div>
              <span className="cardLabel">Order đang mở</span>
              <strong>Bàn 08</strong>
            </div>
            <span className="orderNumber">#CAS-0182</span>
          </div>
          <div className="orderLine">
            <div>
              <strong>Trà sữa ô long</strong>
              <span>Size L · Trân châu</span>
            </div>
            <span>45.000đ</span>
          </div>
          <div className="orderLine">
            <div>
              <strong>Cà phê sữa</strong>
              <span>Ít đá</span>
            </div>
            <span>32.000đ</span>
          </div>
          <div className="orderTotal">
            <span>Tổng thanh toán</span>
            <strong>77.000đ</strong>
          </div>
          <div className="paymentStatus">
            <span className="qrPlaceholder" aria-hidden="true">
              CAS
            </span>
            <div>
              <span>VietQR đã tạo</span>
              <strong>Chờ xác nhận</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="flowStrip" aria-label="Luồng sử dụng">
        {flow.map((step, index) => (
          <div className="flowStep" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>

      <section className="capabilities" id="capabilities">
        <div className="sectionHeading">
          <p className="eyebrow">Nền tảng vận hành</p>
          <h2>Ít thao tác hơn.<br />Nhiều kiểm soát hơn.</h2>
        </div>
        <div className="capabilityGrid">
          {capabilities.map((capability) => (
            <article key={capability.index}>
              <span>{capability.index}</span>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <span>CAS · Restaurant ordering system</span>
        <span>Next.js + Spring Boot</span>
      </footer>
    </main>
  );
}
