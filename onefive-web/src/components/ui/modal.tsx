"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/base/dialog/dialog"

interface BaseProps {
    children: React.ReactNode
}

interface RootCredenzaProps extends BaseProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

interface CredenzaProps extends BaseProps {
    className?: string
    asChild?: true
}

const Credenza = ({ children, ...props }: RootCredenzaProps) => {
    return <Dialog {...props}>{children}</Dialog>
}

const CredenzaTrigger = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <DialogTrigger {...props}>
            {children}
        </DialogTrigger>
    )
}

const CredenzaClose = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <DialogClose {...props}>
            {children}
        </DialogClose>
    )
}

const CredenzaContent = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <DialogContent className={className} {...props}>
            {children}
        </DialogContent>
    )
}

const CredenzaDescription = ({
    className,
    children,
    ...props
}: CredenzaProps) => {
    return (
        <DialogDescription className={className} {...props}>
            {children}
        </DialogDescription>
    )
}

const CredenzaHeader = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <DialogHeader className={className} {...props}>
            {children}
        </DialogHeader>
    )
}

const CredenzaTitle = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <DialogTitle className={className} {...props}>
            {children}
        </DialogTitle>
    )
}

const CredenzaBody = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <div className={cn("px-4 md:px-0", className)} {...props}>
            {children}
        </div>
    )
}

const CredenzaFooter = ({ className, children, ...props }: CredenzaProps) => {
    return (
        <DialogFooter className={className} {...props}>
            {children}
        </DialogFooter>
    )
}

export {
    Credenza,
    CredenzaTrigger,
    CredenzaClose,
    CredenzaContent,
    CredenzaDescription,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
    CredenzaFooter,
}
