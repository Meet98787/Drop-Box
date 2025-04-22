import { MessageRequest, sendMessage } from "@/api/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFormik } from "formik";
import { Link, Loader2, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';
import * as yup from "yup";

const validationSchema = yup.object({
  subject: yup.string().required("Subject is required"),
  message: yup.string().required("Message is required"),
  type: yup.string().required("Type is required"),
  file: yup.array().of(yup.mixed<File>()).nullable()
});

export default function Home() {

  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: MessageRequest) => {
    setIsLoading(true);
    try {
      await sendMessage(values);
      toast.success('Message sent successfully');
      formik.resetForm();
      setFilePreviews([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      subject: "",
      message: "",
      type: "issue",
      file: [] as File[],
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const allowedFileTypes: Record<string, string[]> = {
    issue: ["image/jpeg", "image/png"],
    idea: ["image/jpeg", "image/png", "application/pdf", "application/zip", "application/x-zip-compressed"],
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);
    const type = formik.values.type as "issue" | "idea";

    const allowedTypes = type === "issue"
      ? ["image/jpeg", "image/png"]
      : ["image/jpeg", "image/png", "application/pdf", "application/zip", "application/x-zip-compressed"];

    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      if (type === "issue") {
        toast.error("Only images (JPG, PNG) are allowed for issues.");
      } else {
        toast.error(`Some files have invalid formats for ${type}.`);
      }
    }

    formik.setFieldValue("file", [...(formik.values.file || []), ...validFiles]);

    setFilePreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => (file.type.startsWith("image/") ? URL.createObjectURL(file) : "")),
    ].filter(Boolean));
  };

  return (
    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Send Message</h1>
        <p className="w-[40%] text-muted-foreground text-[14px]"> Share your suggestions, concerns, or feedback with HR and admin.
          Open communication helps us enhance the work environment.
          Provide details for clarity, and we'll review your message promptly. </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
        <div className="flex items-center gap-8">
          <div>
            <span className="text-lg font-bold">Attach file here (Optional)</span>
            <p className="text-[14px] text-muted-foreground">
              Supported file types: <span className="font-medium"> JPG, PNG, MP4, MOV, AVI, ZIP.</span> Max size: <span className="font-medium">50MB</span>, Up to <span className="font-medium">5</span> Files
            </p>
          </div>
          <div className="h-10 w-10 dark:bg-white dark:text-black border flex justify-center items-center rounded-lg bg-black text-white hover:bg-black/80">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Link className="w-5 h-5" />
            </label>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={allowedFileTypes[formik.values.type].join(",")}
              multiple={true}
              onChange={handleFileChange}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filePreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20 border rounded overflow-hidden">
                <img src={preview} alt="File Preview" className="object-cover w-full h-full" />
                <button
                  type="button"
                  className="absolute top-1 right-1 dark:bg-white dark:text-black bg-black text-white w-5 h-5 flex items-center justify-center rounded text-xs"
                  onClick={() => {
                    setFilePreviews(filePreviews.filter((_, i) => i !== index));
                    formik.setFieldValue(
                      "file",
                      (formik.values.file || []).filter((_, i) => i !== index)
                    );
                  }}
                >
                  ✖
                </button>
              </div>
            ))}

            {((formik.values.file || []) as File[])
              .filter((file: File) => !file.type.startsWith("image/"))
              .map((file: File, index: number) => (
                <div key={index} className="relative text-sm text-gray-500">
                  {file.name}
                  <button
                    type="button"
                    className="ml-2 text-black-500"
                    onClick={() => {
                      formik.setFieldValue(
                        "file",
                        (formik.values.file || []).filter((_, i) => i !== index)
                      );
                    }}
                  >
                    ✖
                  </button>
                </div>
              ))}
          </div>

        </div>
        <Input
          name="subject"
          placeholder="Write subject here...."
          value={formik.values.subject}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={
            formik.errors.subject && formik.touched.subject
              ? "border-red-500"
              : ""
          }
        />

        <Select value={formik.values.type} onValueChange={(value) => {
          if (value === "issue" && formik.values.file && formik.values.file.some((file) => !file.type.startsWith("image/"))) {
            formik.setFieldValue("file", []);
          }
          formik.setFieldValue("type", value);
        }}>
          <SelectTrigger
            className={
              formik.errors.type && formik.touched.type ? "border-red-500" : ""
            }
          >
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              <SelectItem value="issue">Issue</SelectItem>
              <SelectItem value="idea">Idea</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Textarea
          name="message"
          placeholder="Write message here...."
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={cn(
            formik.errors.message && formik.touched.message
              ? "border-red-500"
              : "",
            "min-h-64"
          )}
        />

        <div className="ml-auto">
          <Button type="submit">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
          {!isLoading && <SendHorizonal className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </form>
    </div>
  );

}
