import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import { amountDue, formatMoney } from "../utils/format";

export function DeliveriesPage() {
  const { orders, updateDeliveryStatus, updatePaymentStatus } = useAppData();
  const scheduled = orders.filter((order) => order.deliveryStatus !== "배송완료");
  const completed = orders.filter((order) => order.deliveryStatus === "배송완료");
  const unpaid = orders.filter((order) => amountDue(order.amount, order.paidAmount) > 0);
  const unpaidTotal = unpaid.reduce((total, order) => total + amountDue(order.amount, order.paidAmount), 0);

  return <div className="page">
    <PageHeader eyebrow="DELIVERY & COLLECTION" title="배송·수금 관리" description="배송 완료 처리와 수금 현황을 한 화면에서 확인합니다. 모든 내역은 시연용 가짜 데이터입니다." />
    <div className="delivery-summary"><article><span>오늘 배송 예정</span><strong>{scheduled.length}건</strong><p>배송 전 주문 기준</p></article><article><span>배송 완료</span><strong>{completed.length}건</strong><p>현재 표시된 주문 기준</p></article><article><span>미수금 잔액</span><strong>{formatMoney(unpaidTotal)}</strong><p>미수·부분수금 합계</p></article></div>
    <section className="panel"><header className="panel__header"><div><h2>배송 예정 목록</h2><p>처리 후 배송 상태가 화면에 반영됩니다.</p></div></header><div className="delivery-list delivery-list--management">{scheduled.map((order) => <article key={order.id}><div className="delivery-list__date"><b>{order.requestedDate.replace("10월 ", "")}</b><span>희망일</span></div><div className="delivery-list__customer"><b>{order.customerName}</b><p>{order.product} {order.quantity} · {order.id}</p></div><Badge value={order.deliveryStatus} /><strong>{formatMoney(order.amount)}</strong><Button size="sm" onClick={() => updateDeliveryStatus(order.id, "배송완료")}>배송 완료</Button></article>)}{scheduled.length === 0 && <p className="empty-state">현재 배송 예정 주문이 없습니다.</p>}</div></section>
    <div className="two-panel-grid"><section className="panel"><header className="panel__header"><div><h2>미수금 현황</h2><p>수금 상태와 잔액은 별도로 관리됩니다.</p></div></header><div className="collection-list">{unpaid.map((order) => <article key={order.id}><div><b>{order.customerName}</b><p>{order.id} · 주문금액 {formatMoney(order.amount)}</p></div><div><Badge value={order.paymentStatus} /><strong>잔액 {formatMoney(amountDue(order.amount, order.paidAmount))}</strong></div><Button variant="outline" size="sm" onClick={() => updatePaymentStatus(order.id, "완납", order.amount)}>완납 처리</Button></article>)}</div></section><section className="panel"><header className="panel__header"><div><h2>최근 배송 완료</h2><p>완료 처리된 주문 내역입니다.</p></div></header><div className="completed-list">{completed.map((order) => <article key={order.id}><span className="completed-icon">✓</span><div><b>{order.customerName}</b><p>{order.product} {order.quantity} · {order.requestedDate}</p></div><Badge value={order.paymentStatus} /></article>)}</div></section></div>
  </div>;
}
