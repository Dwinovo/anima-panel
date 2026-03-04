import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type DeleteSessionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionName: string
  isDeleting: boolean
  onConfirm: () => Promise<void>
}

export function DeleteSessionDialog({
  open,
  onOpenChange,
  sessionName,
  isDeleting,
  onConfirm,
}: DeleteSessionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete session</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Session <strong>{sessionName}</strong>{' '}
            will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
