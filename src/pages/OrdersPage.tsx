import { FormEvent, useMemo, useState } from "react";

import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import type { DeliveryStatus, Order } from "../types";
import { formatMoney } from "../utils/format";

const deliveryStatuses: DeliveryStatus[] = ["접수", "배차완료", "배송중", "배송완료"];

export function OrdersPage() {
  const { customers, orders, addOrder, updateDeliveryStatus } = useAppData();
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("전체");
  const [status, setStatus] = useState("전체");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const filtered = useMemo(() => orders.filter((order) => {
    const matchesSearch = [order.id, order.customerName, order.product].some((value) => value.includes(search.trim()));
    return matchesSearch && (channel === "전체" || order.channel === channel) && (status === "전체" || order.deliveryStatus === status);
  }), [orders, search, channel, status]);

  function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addOrder({ customerId: String(form.get("customerId")), product: String(form.get("product")), quantity: String(form.get("quantity")), requestedDate: String(form.get("requestedDate")), channel: String(form.get("channel")) as Order["channel"], amount: Number(form.get("amount")), request: String(form.get("request") || "") });
    setCreateOpen(false);
  }

  return <div className="page">
    <PageHeader eyebrow="ORDER DESK" title="주문 관리" description="전화와 온라인으로 접수된 주문을 관리합니다. 배송 상태와 수금 상태는 각각 별도로 표시됩니다." action={<Button onClick={() => setCreateOpen(true)}>＋ 신규 주문 등록</Button>} />
    <section className="panel"><div className="toolbar toolbar--filters"><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="주문번호, 고객명, 제품 검색" /></label><select value={channel} onChange={(event) => setChannel(event.target.value)}><option>전체</option><option>전화</option><option>온라인</option></select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>전체</option>{deliveryStatuses.map((item) => <option key={item}>{item}</option>)}</select><span className="toolbar__count">검색 결과 <b>{filtered.length}</b>건</span></div>
      <div className="table-wrap"><table className="data-table data-table--orders"><thead><tr><th>주문번호</th><th>고객명</th><th>접수일</th><th>제품 · 수량</th><th>희망 배송일</th><th>경로</th><th>배송 상태</th><th>수금 상태</th><th aria-label="상세" /></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}><td className="order-id">{order.id}</td><td><b>{order.customerName}</b></td><td>{order.receivedDate}</td><td>{order.product}<small>{order.quantity}</small></td><td>{order.requestedDate}</td><td><Badge value={order.channel} /></td><td><label className="status-select"><Badge value={order.deliveryStatus} /><select aria-label={order.id + " 배송 상태"} value={order.deliveryStatus} onChange={(event) => updateDeliveryStatus(order.id, event.target.value as DeliveryStatus)}>{deliveryStatuses.map((item) => <option key={item}>{item}</option>)}</select></label></td><td><Badge value={order.paymentStatus} /></td><td><Button variant="soft" size="sm" onClick={() => setSelected(order)}>상세</Button></td></tr>)}</tbody></table></div>
    </section>
    {createOpen && <NewOrderModal customers={customers} onClose={() => setCreateOpen(false)} onSubmit={createOrder} />}
    {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function NewOrderModal({ customers, onClose, onSubmit }: { customers: ReturnType<typeof useAppData>["customers"]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Modal title="신규 주문 등록" description="예시 주문을 추가합니다. 저장 내용은 새로고침하면 초기화됩니다." onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>취소</Button><Button form="order-create-form" type="submit">주문 등록</Button></>}><form id="order-create-form" className="form-grid" onSubmit={onSubmit}><label>고객<select name="customerId" required>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}</select></label><label>주문 경로<select name="channel"><option>전화</option><option>온라인</option></select></label><label>제품<select name="product"><option>실내등유</option><option>보일러등유</option><option>경유</option></select></label><label>수량<input name="quantity" placeholder="예: 200L" required /></label><label>희망 배송일<input name="requestedDate" defaultValue="10월 24일" required /></label><label>주문 금액<input name="amount" type="number" defaultValue="328000" required /></label><label className="form-grid__wide">요청사항<input name="request" placeholder="배송 기사에게 전달할 요청사항" /></label></form></Modal>;
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return <Modal title={order.id + " 주문 상세"} description="주문과 수금 정보를 화면 시연용으로 보여줍니다." onClose={onClose} footer={<Button onClick={onClose}>닫기</Button>}><dl className="detail-grid"><div><dt>고객명</dt><dd>{order.customerName}</dd></div><div><dt>접수 경로</dt><dd><Badge value={order.channel} /></dd></div><div><dt>제품 · 수량</dt><dd>{order.product} {order.quantity}</dd></div><div><dt>희망 배송일</dt><dd>{order.requestedDate}</dd></div><div><dt>주문 금액</dt><dd>{formatMoney(order.amount)}</dd></div><div><dt>수금 상태</dt><dd><Badge value={order.paymentStatus} /></dd></div><div className="detail-grid__wide"><dt>요청사항</dt><dd>{order.request || "등록된 요청사항이 없습니다."}</dd></div></dl></Modal>;
}
