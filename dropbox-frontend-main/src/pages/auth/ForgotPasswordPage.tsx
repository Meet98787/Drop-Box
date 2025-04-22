import { useState } from "react";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { VerifyOTPForm } from "@/components/VerifyOTPForm";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 md:p-10">
      {step === 1 && <ForgotPasswordForm onOTPSent={(email) => { setEmail(email); setStep(2); }} />}
      {step === 2 && <VerifyOTPForm email={email} onVerified={() => setStep(3)} />}
      {step === 3 && <ResetPasswordForm email={email} />}
    </div>
  );
}
