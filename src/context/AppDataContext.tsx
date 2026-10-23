import { createContext, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import { initialCustomers, initialOrders } from "../data/mockData";
import type { Customer, DeliveryStatus, Order, PaymentStatus } from "../types";

interface NewCustomer {
  name: string;
  phone: string;
  address: string;
  product: string;
  memo?: string;
}

interface NewOrder {
  customerId: string;
  product: string;
  quantity: string;
  requestedDate: string;
  channel: Order["channel"];
  amount: number;
  request?: string;
}

interface AppDataValue {
  customers: Customer[];
  orders: Order[];
  addCustomer: (customer: NewCustomer) => void;
  updateCustomer: (customer: Customer) => void;
  addOrder: (order: NewOrder) => void;
  updateDeliveryStatus: (orderId: string, status: DeliveryStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus, paidAmount?: number) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const value = useMemo<AppDataValue>(() => ({
    customers,
    orders,
    addCustomer: (customer) => {
      setCustomers((current) => [{
        ...customer,
        id: "c-" + Date.now(),
        lastOrderDate: "주문 없음",
      }, ...current]);
    },
    updateCustomer: (customer) => {
      setCustomers((current) => current.map((item) => item.id === customer.id ? customer : item));
    },
    addOrder: (order) => {
      const customer = customers.find((item) => item.id === order.customerId);
      if (!customer) return;
      const nextNumber = 1025 + orders.length;
      const now = new Date();
      const receivedDate = now.getFullYear() + "." + String(now.getMonth() + 1).padStart(2, "0") + "." + String(now.getDate()).padStart(2, "0") + " 10:00";
      setOrders((current) => [{
        ...order,
        id: "OE-" + nextNumber,
        customerName: customer.name,
        receivedDate,
        deliveryStatus: "접수",
        paymentStatus: "미수",
        paidAmount: 0,
      }, ...current]);
      setCustomers((current) => current.map((item) => item.id === customer.id ? { ...item, lastOrderDate: "오늘" } : item));
    },
    updateDeliveryStatus: (orderId, status) => {
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, deliveryStatus: status } : order));
    },
    updatePaymentStatus: (orderId, status, paidAmount) => {
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, paymentStatus: status, paidAmount: paidAmount ?? order.paidAmount } : order));
    },
  }), [customers, orders]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider.");
  return context;
}
