import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Sidebar() {
  return (
    <div className="w-16 h-screen bg-background border-r border-border flex flex-col items-center pt-6">
      <Avatar className="w-10 h-10">
        <AvatarImage src="" alt="User" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  )
}
