export function formatMoney(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function amountDue(amount: number, paidAmount: number) {
  return Math.max(0, amount - paidAmount);
}
