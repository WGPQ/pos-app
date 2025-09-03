import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

const AppHeader = () => {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-blue-600">Ely Papelería</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Bell className="w-5 h-5" />
                </Button> */}
                <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">EP</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}

export default AppHeader
