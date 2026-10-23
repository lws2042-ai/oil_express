import { NavLink } from "react-router-dom";

const items = [
  ["/admin", "▦", "대시보드"],
  ["/admin/customers", "♙", "고객 관리"],
  ["/admin/orders", "▤", "주문 관리"],
  ["/admin/deliveries", "◒", "배송·수금 관리"],
  ["/admin/customer-order", "◫", "고객 주문 페이지"],
] as const;

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  return <aside className={"sidebar" + (open ? " sidebar--open" : "")}>
    <NavLink className="brand" to="/admin" onClick={onNavigate}>
      <span className="brand__mark"><i /><i /><i /></span>
      <span>OIL <b>EXPRESS</b><small>DELIVERY DESK</small></span>
    </NavLink>
    <div className="sidebar__tenant"><span className="avatar">남</span><div><b>남한강에너지</b><small>양평 · 난방유 판매</small></div><span className="sidebar__more">⋮</span></div>
    <nav className="sidebar__nav" aria-label="주요 메뉴">
      <p>WORKSPACE</p>
      {items.map(([to, icon, label]) => <NavLink key={to} to={to} end={to === "/admin"} onClick={onNavigate}><span className="sidebar__icon">{icon}</span>{label}</NavLink>)}
    </nav>
    <div className="sidebar__help"><span>?</span><div><b>도움이 필요하신가요?</b><small>업무 가이드 보기</small></div></div>
    <p className="sidebar__note">DEMO UI · 실제 고객 데이터 없음</p>
  </aside>;
}
