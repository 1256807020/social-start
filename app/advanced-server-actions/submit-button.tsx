'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({
  children = '提交',
  pendingText = '提交中…',
  className,
}: {
  children?: React.ReactNode
  pendingText?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{ opacity: pending ? 0.6 : 1 }}
    >
      {pending ? pendingText : children}
    </button>
  )
}
