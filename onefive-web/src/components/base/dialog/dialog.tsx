"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Dialog as AriaDialog, Heading as AriaHeading } from "react-aria-components";
import { Modal, ModalOverlay } from "@/components/application/modals/modal";
import { CloseButton } from "@/components/base/buttons/close-button";
import { cx } from "@/utils/cx";

interface DialogContextValue {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue>({});

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => (
  <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
);

interface DialogContentProps extends ComponentProps<"div"> {
  showCloseButton?: boolean;
}

export const DialogContent = ({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) => {
  const { open, onOpenChange } = useContext(DialogContext);
  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange} isDismissable>
      <Modal>
        <AriaDialog>
          <div
            data-slot="dialog-content"
            className={cx(
              "relative mx-auto flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-primary p-6 shadow-xl",
              className,
            )}
            {...props}
          >
            {showCloseButton && onOpenChange && (
              <CloseButton
                onClick={() => onOpenChange(false)}
                theme="light"
                size="md"
                className="absolute top-3 right-3"
              />
            )}
            {children}
          </div>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
};

export const DialogHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div data-slot="dialog-header" className={cx("flex flex-col gap-1.5 text-left", className)} {...props} />
);

export const DialogTitle = ({ className, children, ...props }: ComponentProps<"h2">) => (
  <AriaHeading
    slot="title"
    data-slot="dialog-title"
    className={cx("text-lg font-semibold leading-none text-primary", className)}
    {...(props as any)}
  >
    {children}
  </AriaHeading>
);

export const DialogDescription = ({ className, ...props }: ComponentProps<"p">) => (
  <p data-slot="dialog-description" className={cx("text-sm text-tertiary", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="dialog-footer"
    className={cx("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);

interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

const openKey = (e: KeyboardEvent) => e.key === "Enter" || e.key === " ";

export const DialogTrigger = ({ children, className, asChild }: DialogTriggerProps) => {
  const { onOpenChange } = useContext(DialogContext);
  const open = () => onOpenChange?.(true);

  if (asChild && isValidElement(children)) {
    const el = children as ReactElement<{
      onClick?: (e: MouseEvent) => void;
      onKeyDown?: (e: KeyboardEvent) => void;
      className?: string;
    }>;
    const p = el.props;
    return cloneElement(el, {
      onClick: (e: MouseEvent) => {
        p.onClick?.(e);
        open();
      },
      onKeyDown: (e: KeyboardEvent) => {
        p.onKeyDown?.(e);
        if (!e.defaultPrevented && openKey(e)) {
          e.preventDefault();
          open();
        }
      },
      className: className ? cx(p.className, className) : p.className,
    } as any);
  }

  if (className) {
    return (
      <span
        className={className}
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => {
          if (openKey(e)) {
            e.preventDefault();
            open();
          }
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="inline-flex"
      onClick={open}
      onKeyDown={(e) => {
        if (openKey(e)) {
          e.preventDefault();
          open();
        }
      }}
    >
      {children}
    </button>
  );
};

export const DialogClose = ({ children, className, asChild }: DialogTriggerProps) => {
  const { onOpenChange } = useContext(DialogContext);
  const close = () => onOpenChange?.(false);

  const patchClose = (el: ReactElement) => {
    const p = el.props as {
      onClick?: (e: MouseEvent) => void;
      className?: string;
    };
    return {
      onClick: (e: MouseEvent) => {
        p.onClick?.(e);
        close();
      },
      className: className ? cx(p.className, className) : p.className,
    } as any;
  };

  const list = Children.toArray(children);
  const onlyChild = list.length === 1 && isValidElement(list[0]) ? (list[0] as ReactElement) : null;

  if (asChild) {
    if (onlyChild) {
      return cloneElement(onlyChild, patchClose(onlyChild));
    }
  } else if (onlyChild) {
    return cloneElement(onlyChild, patchClose(onlyChild));
  }

  if (className) {
    return (
      <span className={className} role="button" tabIndex={0} onClick={close}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={close}>
      {children}
    </button>
  );
};
