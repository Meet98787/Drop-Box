import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

const LogoutButton = () => {
    const authContext = useContext(AuthContext)

    if (!authContext) return null

    return (
        <Button variant="destructive" onClick={authContext.logout}>
            Logout
        </Button>
    )
}

export default LogoutButton
