
import { loginUser } from "@/api/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthContext, AuthContextType } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { user } = useContext(AuthContext) as AuthContextType

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await loginUser({ email, password });
      toast.success("Login successful!");

      const user = response.user;
      if (user.role === "admin") {
        navigate("/dashboard")
      } else if (user.role === "hr") {
        navigate("users")
      } else if (user.role === 'user') {
        navigate('/app')
      } else {
        navigate("/") // Default for normal users
      }

    } catch (err) {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('info')
    if (userId) {
      if (role === "admin") {
        navigate("/dashboard")
      } else if (role === "hr") {
        navigate("users")
      } else if (role === "user") {
        navigate("/app")
      }
    }
  }, [navigate, user])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link to={"/forgot-password"} className="ml-auto text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
