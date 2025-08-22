import Image from 'next/image'
import { cn } from '@/lib/utils'

function EloIcon({
  className,
  src,
  alt
}: {
  className?: string
  src: string
  alt: string
}) {
  return (
    <Image
      className={cn('', className)}
      src={src}
      width={38}
      height={38}
      alt={alt}
    />
  )
}

/**
 * 10.png	Level 10 2001 +
9.png	Level 9 1751 - 2000
8.png	Level 8 1531 - 1750
7.png	Level 7 1351 - 1530
6.png	Level 6 1201 - 1350
5.png	Level 5 1051 - 1200
4.png	Level 4 901 - 1050
3.png	Level 3 751 - 900
2.png	Level 2 501 - 750
1.png	Level 1 100 - 500
 */

export function Elo({ className, elo }: { className?: string; elo: number }) {
  switch (true) {
    case elo >= 2001:
      return <EloIcon className={className} src="/elo/10.png" alt="10" />
    case elo >= 1751:
      return <EloIcon className={className} src="/elo/9.png" alt="9" />
    case elo >= 1531:
      return <EloIcon className={className} src="/elo/8.png" alt="8" />
    case elo >= 1351:
      return <EloIcon className={className} src="/elo/7.png" alt="7" />
    case elo >= 1201:
      return <EloIcon className={className} src="/elo/6.png" alt="6" />
    case elo >= 1051:
      return <EloIcon className={className} src="/elo/5.png" alt="5" />
    case elo >= 901:
      return <EloIcon className={className} src="/elo/4.png" alt="4" />
    case elo >= 751:
      return <EloIcon className={className} src="/elo/3.png" alt="3" />
    case elo >= 501:
      return <EloIcon className={className} src="/elo/2.png" alt="2" />
    case elo >= 100:
      return <EloIcon className={className} src="/elo/1.png" alt="1" />
    default:
      return <EloIcon className={className} src="/elo/1.png" alt="0" />
  }
}
