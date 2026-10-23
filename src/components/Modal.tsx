import type { PropsWithChildren, ReactNode } from "react";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
}

export function Modal({ title, description, onClose, footer, children }: PropsWithChildren<ModalProps>) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="modal__header">
        <div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div>
        <button className="modal__close" type="button" aria-label="닫기" onClick={onClose}>×</button>
      </header>
      <div className="modal__body">{children}</div>
      {footer && <footer className="modal__footer">{footer}</footer>}
    </section>
  </div>;
}
