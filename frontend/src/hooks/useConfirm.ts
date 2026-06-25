import { useCallback, useState, useRef } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'

type DialogState = { open: boolean; message: string }

export function useConfirm(
  message = 'Are you sure?',
  onConfirm: () => void | Promise<void>
) {
  const [dialog, setDialog] = useState<DialogState>({ open: false, message })
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback(
    (msg?: string) => {
      setDialog({ open: true, message: msg || message })
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve
      })
    },
    [message]
  )

  const handleConfirm = useCallback(async () => {
    setDialog({ open: false, message: '' })
    await onConfirm()
    resolverRef.current?.(true)
  }, [onConfirm])

  const handleCancel = useCallback(() => {
    setDialog({ open: false, message: '' })
    resolverRef.current?.(false)
  }, [])

  return {
    confirm,
    ConfirmDialog,
    dialog,
    handleConfirm,
    handleCancel,
  }
}
