import Image from 'next/image'
import { APP_NAME } from '@/lib/constants'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const sizeMap = {
  small: { width: 24, height: 24 },
  medium: { width: 32, height: 32 },
  large: { width: 56, height: 56 },
}

export function Logo({ size = 'medium', className = '' }: LogoProps) {
  const { width, height } = sizeMap[size]

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/flower-cross-black.png"
        width={width}
        height={height}
        alt={APP_NAME}
        className="dark:hidden"
      />
      <Image
        src="/flower-cross-white.png"
        width={width}
        height={height}
        alt={APP_NAME}
        className="hidden dark:block"
      />
    </div>
  )
}
