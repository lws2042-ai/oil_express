import type { Customer, Order } from "../types";

export const initialCustomers: Customer[] = [
  { id: "c-001", name: "김은주", phone: "010-2486-1204", address: "경기도 양평군 양평읍 강남로 114", product: "실내등유", lastOrderDate: "2026.10.19", memo: "오후 2시 이후 통화 선호" },
  { id: "c-002", name: "햇살농원", phone: "031-772-9054", address: "경기도 양평군 용문면 용문산로 281", product: "보일러등유", lastOrderDate: "2026.10.18", memo: "창고 옆 주입구 이용" },
  { id: "c-003", name: "박정호", phone: "010-8830-4176", address: "경기도 양평군 강하면 운심길 36", product: "실내등유", lastOrderDate: "2026.10.15" },
  { id: "c-004", name: "다온펜션", phone: "031-773-6672", address: "경기도 양평군 서종면 북한강로 892", product: "경유", lastOrderDate: "2026.10.12", memo: "관리인 부재 시 문자" },
  { id: "c-005", name: "이순자", phone: "010-3094-5382", address: "경기도 양평군 옥천면 아신역길 51", product: "실내등유", lastOrderDate: "2026.10.07" },
];

export const initialOrders: Order[] = [
  { id: "OE-1024", customerId: "c-001", customerName: "김은주", receivedDate: "2026.10.23 09:14", product: "실내등유", quantity: "200L", requestedDate: "10월 23일", channel: "온라인", deliveryStatus: "접수", paymentStatus: "미수", amount: 328000, paidAmount: 0, request: "오후 3시 이전 배송 부탁드립니다." },
  { id: "OE-1023", customerId: "c-002", customerName: "햇살농원", receivedDate: "2026.10.23 08:35", product: "보일러등유", quantity: "500L", requestedDate: "10월 23일", channel: "전화", deliveryStatus: "배차완료", paymentStatus: "부분수금", amount: 810000, paidAmount: 400000, request: "창고 옆 주입구로 부탁드립니다." },
  { id: "OE-1022", customerId: "c-004", customerName: "다온펜션", receivedDate: "2026.10.22 16:42", product: "경유", quantity: "300L", requestedDate: "10월 24일", channel: "전화", deliveryStatus: "배송중", paymentStatus: "완납", amount: 522000, paidAmount: 522000 },
  { id: "OE-1021", customerId: "c-003", customerName: "박정호", receivedDate: "2026.10.22 14:12", product: "실내등유", quantity: "150L", requestedDate: "10월 22일", channel: "온라인", deliveryStatus: "배송완료", paymentStatus: "완납", amount: 246000, paidAmount: 246000 },
  { id: "OE-1020", customerId: "c-005", customerName: "이순자", receivedDate: "2026.10.21 11:03", product: "실내등유", quantity: "100L", requestedDate: "10월 22일", channel: "전화", deliveryStatus: "배송완료", paymentStatus: "미수", amount: 164000, paidAmount: 0 },
];
