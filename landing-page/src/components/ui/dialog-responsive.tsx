"use client";
import React, { createContext, useContext, type PropsWithChildren } from "react";
// Primitives are CLI-installed by default, but @radix-ui can also be used
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { clx } from "@/lib/utils/clx/clx-merge";
import { useMediaQuery } from "@/components/hooks/use-media-query";
import X from "@/components/icons/x";
import { MOTION, STYLES } from "@/components/ui/_shared";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Shared context to avoid hydration mismatch between Dialog and DialogTrigger
const ResponsiveDialogContext = createContext<boolean | null>(null);

const DialogPortal = DialogPrimitive.Portal;
const BaseDialog = DialogPrimitive.Root;
const BaseDialogTrigger = DialogPrimitive.Trigger;
const BaseDialogClose = DialogPrimitive.Close;

const BaseDialogHeader = clx.div(STYLES.FLEX_COL, "items-center space-y-1.5");
const BaseDialogFooter = clx.div(
  "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
);
const BaseDialogTitle = clx(
  DialogPrimitive.Title,
  "text-lg font-semibold leading-none tracking-tight"
);
const BaseDialogDescription = clx(
  DialogPrimitive.Description,
  "text-sm text-muted-foreground"
);
const DialogOverlay = clx(
  DialogPrimitive.Overlay,
  MOTION.ANIMATE_IN,
  MOTION.ANIMATE_OUT,
  MOTION.FADE_IN_OUT,
  "fixed inset-0 z-50 bg-black/80 "
);

const DialogRoot = clx(
  DialogPrimitive.Content,
  MOTION.ANIMATE_IN,
  MOTION.ANIMATE_OUT,
  MOTION.FADE_IN_OUT,
  MOTION.ZOOM_IN_OUT,
  MOTION.DIALOG_SLIDE_IN_OUT,
  "translate-x-[-50%] translate-y-[-50%]",
  "z-50 fixed left-[50%] top-[50%]",
  "grid w-full gap-4 p-6",
  "max-w-lg border bg-background shadow-lg duration-200  sm:rounded-lg"
);

const DialogCloseRoot = clx(
  DialogPrimitive.Close,
  STYLES.OFFSET_BG,
  STYLES.RING_FOCUS,
  "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
  "absolute right-4 top-4 rounded-sm opacity-70  transition-opacity hover:opacity-100 disabled:pointer-events-none"
);

function BaseDialogContent({
  children,
  ...props
}: PropsWithChildren<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogRoot {...props}>
        {children}
        <DialogCloseRoot>
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogCloseRoot>
      </DialogRoot>
    </DialogPortal>
  );
}

//

//

/*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
/*                        RESPONSIVE                          */
/*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

interface RootDialogProps extends PropsWithChildren {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogProps extends PropsWithChildren {
  className?: string;
  asChild?: true;
}

const Dialog = ({ children, ...props }: RootDialogProps) => {
  const isDesktop = useMediaQuery("md");
  const DialogRoot = isDesktop ? BaseDialog : Drawer;

  return (
    <ResponsiveDialogContext.Provider value={isDesktop}>
      <DialogRoot {...props}>{children}</DialogRoot>
    </ResponsiveDialogContext.Provider>
  );
};

function useResponsiveDialog() {
  const context = useContext(ResponsiveDialogContext);
  // Fallback for components used outside Dialog (e.g. in other dialogs) - assume desktop
  return context ?? true;
}

const DialogTrigger = ({ className, children, ...props }: DialogProps) => {
  const isDesktop = useResponsiveDialog();
  const Trigger = isDesktop ? BaseDialogTrigger : DrawerTrigger;

  return (
    <Trigger className={className} {...props}>
      {children}
    </Trigger>
  );
};

const DialogClose = ({ className, children, ...props }: DialogProps) => {
  const isDesktop = useResponsiveDialog();
  const Close = isDesktop ? BaseDialogClose : DrawerClose;

  return (
    <Close className={className} {...props}>
      {children}
    </Close>
  );
};

const DialogContent = ({ className, children, ...props }: DialogProps) => {
  const isDesktop = useResponsiveDialog();
  const Content = isDesktop ? BaseDialogContent : DrawerContent;

  return (
    <Content 
      className={className} 
      {...props}
    >
      {children}
    </Content>
  );
};

const DialogDescription = ({ className, children, ...props }: DialogProps) => {
  const isDesktop = useResponsiveDialog();
  const Description = isDesktop
    ? BaseDialogDescription
    : DrawerDescription;

  return (
    <Description className={className} {...props}>
      {children}
    </Description>
  );
};

const DialogHeader = ({ className, children, ...props }: DialogProps) => {
  const isDesktop = useResponsiveDialog();
  const Header = isDesktop ? BaseDialogHeader : DrawerHeader;

  return (
    <Header className={className} {...props}>
      {children}
    </Header>
  );
};

const DialogTitle = ({ className, children, ...props }: DialogProps) => {
  const isDesktop = useResponsiveDialog();
  const Title = isDesktop ? BaseDialogTitle : DrawerTitle;

  return (
    <Title className={className} {...props}>
      {children}
    </Title>
  );
};

const DialogFooter = ({ className, children, ...props }: DialogProps) => {
  const isDesktop = useResponsiveDialog();
  const Footer = isDesktop ? BaseDialogFooter : DrawerFooter;

  return (
    <Footer className={className} {...props}>
      {children}
    </Footer>
  );
};

const DialogBody = clx.div("px-4 md:px-0");

// const DialogBody = ({ className, children, ...props }: DialogProps) => {
//   return (
//     <div className={cn("px-4 md:px-0", className)} {...props}>
//       {children}
//     </div>
//   );
// };

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
