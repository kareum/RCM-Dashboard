import type { ReactNode, ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  iconOnly?: boolean
  children?: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-[#004b8c] shadow-sm',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-[#b3d8ee]',
  ghost:
    'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high',
  danger:
    'bg-error-container text-on-error-container hover:bg-[#ffc8c3]',
}

const sizeClass: Record<ButtonSize, (iconOnly: boolean) => string> = {
  sm: (io) => io ? 'h-7 w-7'          : 'h-7 px-3 gap-1.5 text-xs',
  md: (io) => io ? 'h-9 w-9'          : 'h-9 px-4 gap-2   text-sm',
  lg: (io) => io ? 'h-11 w-11'        : 'h-11 px-5 gap-2   text-sm',
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  leftIcon,
  rightIcon,
  iconOnly = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center font-semibold rounded',
        'transition-all duration-150 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size](iconOnly),
        className,
      ].join(' ')}
      disabled={disabled}
      {...props}
    >
      {leftIcon}
      {!iconOnly && children}
      {rightIcon}
    </button>
  )
}
