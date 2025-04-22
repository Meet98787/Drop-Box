import { createUser } from "@/api/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-toastify";
import * as yup from "yup";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  // password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  role: yup.string().required("Role is required"),
});

interface CreateUserProps {
  getUsers: () => Promise<void>; // Function to get the users
}

const CreateUser: React.FC<CreateUserProps> = ({ getUsers }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name: string; email: string; role: "admin" | "hr" | "user" }) => {
    try {
      await createUser(values);
      formik.resetForm();
      toast.success("User Created Successfully");
      getUsers();
    } catch (error) {
      console.error("Error Creating User", error);
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "user",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Create User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Fill all the inputs carefully.</DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter name"
              className={`mt-2 ${formik.errors.name && formik.touched.name ? "border-red-500" : ""}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.errors.name && formik.touched.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Enter email"
              type="email"
              className={`mt-2 ${formik.errors.email && formik.touched.email ? "border-red-500" : ""}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.errors.email && formik.touched.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="Enter password"
              type="password"
              className={`mt-2 ${formik.errors.password && formik.touched.password ? "border-red-500" : ""}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.errors.password && formik.touched.password && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
            )}
          </div> */}

          <div>
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => formik.setFieldValue("role", value)}>
              <SelectTrigger className={`mt-2 ${formik.errors.role && formik.touched.role ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Role</SelectLabel>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.errors.role && formik.touched.role && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.role}</p>
            )}
          </div>
          <DialogFooter>
            <Button disabled={loading} type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



export default CreateUser;
