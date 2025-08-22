import { cn } from '@/lib/utils'
import { RosterQueryData } from '@/services/challengermode.dto'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export function UserAvatar({
  member,
  className,
  imageClassName,
  fallbackClassName
}: {
  member: RosterQueryData['tournament']['attendance']['roster']['lineups'][number]['members'][number]
  className?: string
  imageClassName?: string
  fallbackClassName?: string
}) {
  return (
    <Avatar className={cn('size-5', className)}>
      <AvatarImage
        className={cn('object-fit', imageClassName)}
        src={member.user.profilePicture?.url}
      />
      <AvatarFallback className={cn('text-xs uppercase', fallbackClassName)}>
        {member.user.username[0]}
      </AvatarFallback>
    </Avatar>
  )
}
