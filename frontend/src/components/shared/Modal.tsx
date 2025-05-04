import React, { useRef, forwardRef, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";

type ModalProps = {
  beforeClose?: () => void;
  children: React.ReactNode;
};

export type ModalHandle = {
  open: () => void;
  close: () => void;
};

const Modal = forwardRef<ModalHandle, ModalProps>((props, ref) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const animationDuration = 300; // ms, moet overeenkomen met de CSS-animatie duur

  const handleOpen = () => {
    dialogRef.current?.showModal();
    dialogRef.current?.classList.remove(styles.animateOut);
    dialogRef.current?.classList.add(styles.animateIn);
  };

  const handleClose = () => {
    if (typeof props.beforeClose === "function") {
      props.beforeClose();
    }
    if (dialogRef.current) {
      dialogRef.current.classList.remove(styles.animateIn);
      dialogRef.current.classList.add(styles.animateOut);
      setTimeout(() => {
        dialogRef.current?.close();
        dialogRef.current?.classList.remove(styles.animateOut);
      }, animationDuration);
    }
  };

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  const handleOutsideClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <dialog ref={dialogRef} className={styles.modal} onClick={handleOutsideClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          &times;
        </button>
        {props.children}
      </div>
    </dialog>,
    modalRoot
  );
});

export default Modal;
