"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
} from "react-aria-components";
import { Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface AlertDialogContextValue {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue>({});

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => (
  <AlertDialogContext.Provider value={{ open, onOpenChange }}>
    {children}
  </AlertDialogContext.Provider>
);

export const AlertDialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<"div">) => {
  const { open, onOpenChange } = useContext(AlertDialogContext);
  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange}>
      <Modal>
        <AriaDialog role="alertdialog">
          <div
            data-slot="alert-dialog-content"
            className={cx(
              "relative mx-auto flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-primary p-6 shadow-xl",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
};

export const AlertDialogHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="alert-dialog-header"
    className={cx("flex flex-col gap-2 text-left", className)}
    {...props}
  />
);

export const AlertDialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="alert-dialog-footer"
    className={cx(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);

export const AlertDialogTitle = ({ className, children, ...props }: ComponentProps<"h2">) => (
  <AriaHeading
    slot="title"
    data-slot="alert-dialog-title"
    className={cx("text-lg font-semibold leading-none text-primary", className)}
    {...(props as any)}
  >
    {children}
  </AriaHeading>
);

export const AlertDialogDescription = ({
  className,
  ...props
}: ComponentProps<"p">) => (
  <p
    data-slot="alert-dialog-description"
    className={cx("text-sm text-tertiary", className)}
    {...props}
  />
);

interface AlertDialogActionProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

export const AlertDialogAction = ({
  className,
  onClick,
  children,
  asChild: _asChild,
  ...props
}: AlertDialogActionProps) => {
  const { onOpenChange } = useContext(AlertDialogContext);
  return (
    <Button
      color="primary"
      size="sm"
      className={className}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>);
        onOpenChange?.(false);
      }}
      {...(props as any)}
    >
      {children}
    </Button>
  );
};

export const AlertDialogCancel = ({
  className,
  onClick,
  children,
  asChild: _asChild,
  ...props
}: AlertDialogActionProps) => {
  const { onOpenChange } = useContext(AlertDialogContext);
  return (
    <Button
      color="secondary"
      size="sm"
      className={className}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>);
        onOpenChange?.(false);
      }}
      {...(props as any)}
    >
      {children}
    </Button>
  );
};

export const AlertDialogTrigger = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);
