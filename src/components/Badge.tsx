import type { DeliveryStatus, PaymentStatus } from "../types";

interface BadgeProps {
  value: DeliveryStatus | PaymentStatus | "전화" | "온라인";
}

const badgeClass: Record<BadgeProps["value"], string> = {
  "접수": "gray",
  "배차완료": "blue",
  "배송중": "orange",
  "배송완료": "green",
  "미수": "red",
  "부분수금": "orange",
  "완납": "green",
  "전화": "navy",
  "온라인": "blue",
};

export function Badge({ value }: BadgeProps) {
  return <span className={"badge badge--" + badgeClass[value]}>{value}</span>;
}
