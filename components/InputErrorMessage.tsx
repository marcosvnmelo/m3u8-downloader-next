import { cn } from '@/lib/utils';
import React, { DetailedHTMLProps } from 'react';

interface InputErrorMessageProps
  extends DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {}

export default function InputErrorMessage({
  children,
  className,
  ...rest
}: InputErrorMessageProps) {
  //* render
  return (
    <span className={cn('text-xs text-red-600', className)} {...rest}>
      {children}
    </span>
  );
}
