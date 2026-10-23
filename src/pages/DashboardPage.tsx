import { Link } from "react-router-dom";

import { Badge } from "../components/Badge";
import { PageHeader } from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { amountDue, formatMoney } from "../utils/format";

export function DashboardPage() {
  const { orders } = useAppData();
  const todayOrders = orders.filter((order) => order.receivedDate.startsWith("2026.10.23"));
  const dueToday = orders.filter((order) => order.requestedDate === "10월 23일" && order.deliveryStatus !== "배송완료");
  const notDelivered = orders.filter((order) => order.deliveryStatus !== "배송완료");
  const unpaidTotal = orders.reduce((total, order) => total + amountDue(order.amount, order.paidAmount), 0);

  const cards = [
    ["오늘 신규 주문", String(todayOrders.length), "어제보다 1건 증가", "orders"],
    ["오늘 배송 예정", String(dueToday.length), "오전 배송 1건 포함", "delivery"],
    ["미배송 주문", String(notDelivered.length), "배차 확인이 필요합니다", "alert"],
    ["미수금 합계", formatMoney(unpaidTotal), "총 3건의 미수 내역", "money"],
  ];

  return <div className="page">
    <PageHeader eyebrow="OVERVIEW · 2026.10.23 FRI" title="오늘의 업무 현황" description="판매·배송·수금 현황을 한곳에서 확인하세요. 모든 숫자는 화면 시연용 예시입니다." />
    <div className="summary-grid">{cards.map(([label, value, note, tone]) => <article className="summary-card" key={label}><div className={"summary-card__icon summary-card__icon--" + tone}>{tone === "money" ? "₩" : tone === "delivery" ? "◒" : tone === "alert" ? "!" : "▤"}</div><p>{label}</p><strong>{value}</strong><small>{note}</small></article>)}</div>
    <div className="dashboard-grid">
      <section className="panel panel--wide"><header className="panel__header"><div><h2>오늘의 주문</h2><p>10월 23일 접수된 주문입니다.</p></div><Link to="/orders" className="text-button">전체 주문 보기 <span>→</span></Link></header><div className="table-wrap"><table className="data-table"><thead><tr><th>주문번호</th><th>고객명</th><th>제품 · 수량</th><th>희망 배송일</th><th>배송 상태</th><th>수금 상태</th></tr></thead><tbody>{todayOrders.map((order) => <tr key={order.id}><td className="order-id">{order.id}</td><td><b>{order.customerName}</b><small>{order.channel} 주문</small></td><td>{order.product}<small>{order.quantity}</small></td><td>{order.requestedDate}</td><td><Badge value={order.deliveryStatus} /></td><td><Badge value={order.paymentStatus} /></td></tr>)}</tbody></table></div></section>
      <section className="panel quick-panel"><header className="panel__header"><div><h2>빠른 작업</h2><p>자주 쓰는 업무를 바로 시작합니다.</p></div></header><div className="quick-actions"><Link to="/customers"><span>＋</span><div><b>고객 등록</b><small>신규 고객 정보 추가</small></div><i>→</i></Link><Link to="/orders"><span>＋</span><div><b>주문 등록</b><small>전화 주문을 바로 입력</small></div><i>→</i></Link><Link to="/customer-order"><span>◫</span><div><b>고객 주문 페이지</b><small>모바일 화면 미리보기</small></div><i>→</i></Link></div></section>
      <section className="panel panel--wide"><header className="panel__header"><div><h2>배송이 필요한 주문</h2><p>배송 완료 전인 주문을 확인하세요.</p></div><Link to="/deliveries" className="text-button">배송 관리 <span>→</span></Link></header><div className="delivery-list">{notDelivered.slice(0, 3).map((order) => <article key={order.id}><div className="delivery-list__date"><b>{order.requestedDate.replace("10월 ", "")}</b><span>배송 희망</span></div><div><b>{order.customerName}</b><p>{order.product} {order.quantity} · {order.id}</p></div><Badge value={order.deliveryStatus} /><strong>{formatMoney(order.amount)}</strong></article>)}</div></section>
      <section className="panel activity-panel"><header className="panel__header"><div><h2>최근 주문 내역</h2><p>마지막으로 등록된 주문입니다.</p></div></header><ol className="activity-list">{orders.slice(0, 4).map((order) => <li key={order.id}><span className="activity-list__dot" /><div><b>{order.customerName} · {order.product} {order.quantity}</b><p>{order.receivedDate} · {order.channel} 주문</p></div></li>)}</ol></section>
    </div>
  </div>;
}
