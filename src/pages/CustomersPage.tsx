import { FormEvent, useMemo, useState } from "react";

import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import type { Customer } from "../types";

export function CustomersPage() {
  const { customers, orders, addCustomer, updateCustomer } = useAppData();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const filteredCustomers = useMemo(() => customers.filter((customer) => [customer.name, customer.phone, customer.address].some((value) => value.includes(search.trim()))), [customers, search]);

  function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addCustomer({ name: String(form.get("name")), phone: String(form.get("phone")), address: String(form.get("address")), product: String(form.get("product")), memo: String(form.get("memo") || "") });
    setCreateOpen(false);
  }

  return <div className="page">
    <PageHeader eyebrow="CUSTOMER DIRECTORY" title="고객 관리" description="고객 정보와 주문 이력을 관리합니다. 입력 내용은 이 브라우저 화면에만 반영됩니다." action={<Button onClick={() => setCreateOpen(true)}>＋ 신규 고객 등록</Button>} />
    <section className="panel">
      <div className="toolbar"><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="고객명, 연락처, 주소 검색" /></label><span className="toolbar__count">총 <b>{filteredCustomers.length}</b>명</span></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>고객명</th><th>연락처</th><th>배송 주소</th><th>주요 제품</th><th>최근 주문일</th><th aria-label="관리" /></tr></thead><tbody>{filteredCustomers.map((customer) => <tr key={customer.id}><td><button type="button" className="table-name" onClick={() => setSelected(customer)}>{customer.name}</button></td><td>{customer.phone}</td><td className="table-address">{customer.address}</td><td><span className="product-tag">{customer.product}</span></td><td>{customer.lastOrderDate}</td><td><Button variant="soft" size="sm" onClick={() => setSelected(customer)}>상세 보기</Button></td></tr>)}</tbody></table></div>
    </section>
    {createOpen && <CustomerFormModal title="신규 고객 등록" onClose={() => setCreateOpen(false)} onSubmit={createCustomer} />}
    {selected && <CustomerDetailModal customer={selected} orders={orders.filter((order) => order.customerId === selected.id)} onClose={() => setSelected(null)} onSave={(customer) => { updateCustomer(customer); setSelected(customer); }} />}
  </div>;
}

function CustomerFormModal({ title, onClose, onSubmit }: { title: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Modal title={title} description="저장하면 현재 브라우저 화면에만 반영됩니다." onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>취소</Button><Button form="customer-create-form" type="submit">고객 등록</Button></>}><form id="customer-create-form" className="form-grid" onSubmit={onSubmit}><label>고객명<input name="name" placeholder="예: 김은주" required /></label><label>연락처<input name="phone" placeholder="예: 010-0000-0000" required /></label><label className="form-grid__wide">배송 주소<input name="address" placeholder="예: 경기도 양평군 양평읍" required /></label><label>주요 제품<select name="product"><option>실내등유</option><option>보일러등유</option><option>경유</option></select></label><label>메모<input name="memo" placeholder="배송 시 참고할 사항" /></label></form></Modal>;
}

function CustomerDetailModal({ customer, orders, onClose, onSave }: { customer: Customer; orders: ReturnType<typeof useAppData>["orders"]; onClose: () => void; onSave: (customer: Customer) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(customer);
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSave(draft); setEditing(false); }
  return <Modal title={customer.name + " 고객 정보"} description="고객별 주문 이력과 배송 참고 사항을 확인합니다." onClose={onClose} footer={editing ? <><Button variant="outline" onClick={() => { setDraft(customer); setEditing(false); }}>취소</Button><Button form="customer-edit-form" type="submit">변경 저장</Button></> : <Button onClick={() => setEditing(true)}>정보 수정</Button>}>
    {editing ? <form id="customer-edit-form" className="form-grid" onSubmit={save}><label>고객명<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>연락처<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><label className="form-grid__wide">배송 주소<input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label><label>주요 제품<input value={draft.product} onChange={(event) => setDraft({ ...draft, product: event.target.value })} /></label><label>메모<input value={draft.memo ?? ""} onChange={(event) => setDraft({ ...draft, memo: event.target.value })} /></label></form> : <><dl className="detail-grid"><div><dt>연락처</dt><dd>{customer.phone}</dd></div><div><dt>주요 제품</dt><dd>{customer.product}</dd></div><div className="detail-grid__wide"><dt>배송 주소</dt><dd>{customer.address}</dd></div><div className="detail-grid__wide"><dt>배송 메모</dt><dd>{customer.memo || "등록된 메모가 없습니다."}</dd></div></dl><div className="history-block"><div><h3>주문 이력</h3><span>{orders.length}건</span></div>{orders.length ? <ul>{orders.map((order) => <li key={order.id}><b>{order.product} {order.quantity}</b><span>{order.receivedDate.slice(0, 10)} · {order.deliveryStatus}</span></li>)}</ul> : <p>등록된 주문 이력이 없습니다.</p>}</div></>}
  </Modal>;
}
