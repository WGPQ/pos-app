import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

const AppHeader = () => {
    return (
       <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Ely Papelería
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* <Button variant="ghost" size="icon" className="text-purple-400 hover:text-purple-600 hover:bg-purple-50">
                <Bell className="w-5 h-5" />
              </Button> */}
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium">
                  EP
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
    )
}

export default AppHeader
