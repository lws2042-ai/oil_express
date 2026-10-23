export type DeliveryStatus = "접수" | "배차완료" | "배송중" | "배송완료";
export type PaymentStatus = "미수" | "부분수금" | "완납";
export type OrderChannel = "전화" | "온라인";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  lastOrderDate: string;
  memo?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  receivedDate: string;
  product: string;
  quantity: string;
  requestedDate: string;
  channel: OrderChannel;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  paidAmount: number;
  request?: string;
}
