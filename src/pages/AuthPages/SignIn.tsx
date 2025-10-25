import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function SignIn() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const errorMessage = (location.state as any)?.error as string | undefined;
  if (isLoading) return null; // Or a spinner if you prefer
  // If authenticated and no error context, send to dashboard; otherwise allow showing the error on this page
  if (isAuthenticated && !errorMessage) return <Navigate to="/" replace />;
  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm errorMessage={errorMessage} />
      </AuthLayout>
    </>
  );
}
