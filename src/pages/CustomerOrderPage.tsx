import { FormEvent, useState } from "react";

import { useAppData } from "../context/AppDataContext";

export function CustomerOrderPage() {
  const { addOrder } = useAppData();
  const [product, setProduct] = useState("실내등유");
  const [quantity, setQuantity] = useState("200");
  const [deliveryDate, setDeliveryDate] = useState("2026-10-24");
  const [request, setRequest] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const date = new Date(deliveryDate + "T00:00:00");
    addOrder({
      customerId: "c-001",
      product,
      quantity: quantity + "L",
      requestedDate: (date.getMonth() + 1) + "월 " + date.getDate() + "일",
      channel: "온라인",
      amount: Number(quantity) * (product === "경유" ? 1740 : 1640),
      request,
    });
    setSubmitted(true);
  }

  return <div className="customer-preview"><div className="customer-preview__info"><p className="eyebrow">CUSTOMER MOBILE PAGE</p><h1>고객이 받은 문자 링크 화면을 미리봅니다.</h1><p>휴대전화에서 한 손으로 주문할 수 있도록 간단한 입력과 주문 요약을 중심으로 구성했습니다.</p><div className="preview-points"><span>✓ 고객 정보 자동 표시</span><span>✓ 주문 전 내용 확인</span><span>✓ 접수 후 완료 화면</span></div></div><div className="phone-frame"><div className="phone-frame__speaker" />{submitted ? <OrderComplete onReset={() => setSubmitted(false)} /> : <form className="mobile-order" onSubmit={submitOrder}><header><div className="mobile-order__brand"><span><i /><i /><i /></span> OIL <b>EXPRESS</b></div><small>간편 주문</small></header><section className="mobile-order__intro"><p>안녕하세요, <b>김은주</b>님</p><h2>난방유를<br />간편하게 주문하세요.</h2></section><section className="mobile-order__address"><span>배송지</span><b>경기도 양평군 양평읍 강남로 114</b><small>주소 변경은 판매자에게 문의해 주세요.</small></section><section className="mobile-order__form"><label>제품<select value={product} onChange={(event) => setProduct(event.target.value)}><option>실내등유</option><option>보일러등유</option><option>경유</option></select></label><label>주문 수량<div className="quantity-input"><input value={quantity} inputMode="numeric" onChange={(event) => setQuantity(event.target.value.replace(/[^0-9]/g, ""))} /><span>L</span></div></label><label>희망 배송일<input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label><label>추가 요청사항<textarea value={request} onChange={(event) => setRequest(event.target.value)} placeholder="배송 시 참고할 내용을 적어주세요." /></label></section><section className="mobile-order__summary"><div><span>주문 내용</span><b>{product} {quantity || "0"}L</b></div><div><span>희망 배송</span><b>{deliveryDate.replaceAll("-", ".")}</b></div><small>정확한 금액은 주문 확인 후 안내됩니다.</small></section><button className="mobile-order__submit" type="submit">주문 내용 확인 · 접수하기 <span>→</span></button></form>}</div></div>;
}

function OrderComplete({ onReset }: { onReset: () => void }) {
  return <section className="order-complete"><div className="order-complete__check">✓</div><p>OIL EXPRESS</p><h2>주문 접수가<br />완료되었습니다.</h2><span>판매자가 주문 내용을 확인한 뒤<br />배송 일정과 금액을 안내해 드립니다.</span><div><b>예시 주문번호</b><strong>OE-10XX</strong></div><button type="button" onClick={onReset}>주문 화면 다시 보기</button></section>;
}
