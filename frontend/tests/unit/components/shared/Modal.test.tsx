import React, { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import Modal from '@/components/shared/Modal';

// Importeer ModalHandle type!
type ModalHandle = {
  open: () => void;
  close: () => void;
};

// Setup voor portal (modal-root)
beforeEach(() => {
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
});

afterEach(() => {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    document.body.removeChild(modalRoot);
  }
});

// Mock voor showModal en close
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true;
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.open = false;
    };
  }
});

describe('Modal component', () => {
  it('does not render when modalRoot is missing', () => {
    const existingRoot = document.getElementById('modal-root');
    if (existingRoot) {
      existingRoot.remove();
    }

    const { container } = render(<Modal>Test Content</Modal>);
    expect(container.firstChild).toBeNull();
  });

  it('renders children when open is called', async () => {
    const modalRef = createRef<ModalHandle>();

    render(
      <Modal ref={modalRef}>
        <div>Modal Content</div>
      </Modal>,
    );

    act(() => {
      modalRef.current?.open();
    });

    const modalRoot = document.getElementById('modal-root')!;
    expect(modalRoot.textContent).toContain('Modal Content');
  });

  it('closes when close is called', async () => {
    const modalRef = createRef<ModalHandle>();

    render(
      <Modal ref={modalRef}>
        <div>Modal Content</div>
      </Modal>,
    );

    act(() => {
      modalRef.current?.open();
    });

    const modalRoot = document.getElementById('modal-root')!;
    expect(modalRoot.textContent).toContain('Modal Content');

    act(() => {
      modalRef.current?.close();
    });

    await new Promise((r) => setTimeout(r, 350));

    const dialog = document.querySelector('dialog')!;
    expect(dialog.open).toBeFalsy();
  });

  it('calls beforeClose callback when closing', async () => {
    const beforeClose = vi.fn();
    const modalRef = createRef<ModalHandle>();

    render(
      <Modal ref={modalRef} beforeClose={beforeClose}>
        <div>Modal Content</div>
      </Modal>,
    );

    act(() => {
      modalRef.current?.open();
    });

    act(() => {
      modalRef.current?.close();
    });

    expect(beforeClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when clicking outside', async () => {
    const modalRef = createRef<ModalHandle>();

    render(
      <Modal ref={modalRef}>
        <div>Modal Content</div>
      </Modal>,
    );

    act(() => {
      modalRef.current?.open();
    });

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    fireEvent.click(dialog);

    await new Promise((r) => setTimeout(r, 350));

    expect(dialog.open).toBeFalsy();
  });

  it('does not close when clicking inside the content', async () => {
    const modalRef = createRef<ModalHandle>();

    render(
      <Modal ref={modalRef}>
        <div data-testid="content">Modal Content</div>
      </Modal>,
    );

    act(() => {
      modalRef.current?.open();
    });

    const content = document.querySelector(
      '[data-testid="content"]',
    ) as HTMLElement;
    fireEvent.click(content);

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBeTruthy();
  });

  it('closes when clicking the close button', async () => {
    const modalRef = createRef<ModalHandle>();

    render(
      <Modal ref={modalRef}>
        <div>Modal Content</div>
      </Modal>,
    );

    act(() => {
      modalRef.current?.open();
    });

    const closeButton = document.querySelector('button')!;
    fireEvent.click(closeButton);

    await new Promise((r) => setTimeout(r, 350));

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBeFalsy();
  });
});
