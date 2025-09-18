import React, { Suspense } from "react";
import ResetPasswordPageContent from './pageContent';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}