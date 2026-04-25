"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
} from "react-aria-components";
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
  <DialogContext.Provider value={{ open, onOpenChange }}>
    {children}
  </DialogContext.Provider>
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
  <div
    data-slot="dialog-header"
    className={cx("flex flex-col gap-1.5 text-left", className)}
    {...props}
  />
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

export const DialogDescription = ({
  className,
  ...props
}: ComponentProps<"p">) => (
  <p
    data-slot="dialog-description"
    className={cx("text-sm text-tertiary", className)}
    {...props}
  />
);

export const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="dialog-footer"
    className={cx(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);

interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const DialogTrigger = ({ children, className }: DialogTriggerProps) => {
  if (className) {
    return <span className={className}>{children}</span>;
  }
  return <>{children}</>;
};

export const DialogClose = ({ children, className }: DialogTriggerProps) => {
  if (className) {
    return <span className={className}>{children}</span>;
  }
  return <>{children}</>;
};
