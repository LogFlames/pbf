"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { Button } from "./ui/button";

export default function ButtonWithConfirm(props: { onConfirm?: () => void, onCancel?: () => void, title?: string, description?: string, confirmText?: string, cancelText?: string, triggerText?: string, triggerClassName?: string, triggerDisabled?: boolean }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className={props.triggerClassName} disabled={props.triggerDisabled}>{props.triggerText}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{props.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {props.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={props.onCancel}>{props.cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={props.onConfirm}>{props.confirmText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}