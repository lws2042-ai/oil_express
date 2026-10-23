import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "../components/Sidebar";

export function WorkspaceLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <div className="workspace">
    <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    <section className="workspace__main">
      <header className="topbar">
        <button className="menu-button" type="button" aria-label="메뉴 열기" onClick={() => setMenuOpen(true)}>☰</button>
        <div className="topbar__crumb"><span>남한강에너지</span><i>/</i><b>운영 관리</b></div>
        <div className="topbar__right"><span className="demo-pill"><i /> 예시 데이터</span><button className="notification" type="button" aria-label="알림">♧<em>2</em></button><span className="topbar__avatar">남</span></div>
      </header>
      <div className="workspace__content"><Outlet /></div>
    </section>
  </div>;
}
