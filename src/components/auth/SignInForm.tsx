import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

interface FormData {
  identifier: string;
  password: string;
}

interface FormErrors {
  identifier?: string;
  password?: string;
  general?: string;
  isAdminError?: boolean;
}

interface SignInFormProps {
  errorMessage?: string;
}

export default function SignInForm({ errorMessage }: SignInFormProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || "/";

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (errorMessage && showErrorMessage) {
      const timer = setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [errorMessage, showErrorMessage]);

  // Reset error message visibility when errorMessage changes
  useEffect(() => {
    if (errorMessage) {
      setShowErrorMessage(true);
    }
  }, [errorMessage]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Username or email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Use the login method from AuthContext instead of authApi.login
      const result = await login(formData.identifier.trim(), formData.password);
      
      if (result.success) {
        // Show success message briefly before redirect
        setSuccessMessage("Login successful! Redirecting...");
        
        // Redirect immediately after successful login
        navigate(from, { replace: true });
      } else {
        // Display the specific error message from the server
        const errorMessage = result.error || "Login failed. Please check your credentials.";
        
        // Check if it's an admin access error and display it prominently
        if (errorMessage.includes("admin privileges") || errorMessage.includes("Access denied")) {
          setErrors({ 
            general: errorMessage,
            isAdminError: true 
          });
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Login failed. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username/email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Admin Access Error Message - Centered */}
                {errorMessage && showErrorMessage && (
                  <div className="mx-auto max-w-md">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-700 dark:bg-amber-900/20 transition-opacity duration-500 ease-in-out relative">
                      <button
                        onClick={() => setShowErrorMessage(false)}
                        className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
                        aria-label="Dismiss error"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex items-center justify-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-amber-500 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 text-center">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Access Restricted
                          </p>
                          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                            {errorMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Success Message */}
                {successMessage && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    {successMessage}
                  </div>
                )}
                {/* General Error */}
                {errors.general && (
                  <div className={`p-4 text-sm rounded-lg border ${
                    errors.isAdminError 
                      ? 'text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200' 
                      : 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                  }`}>
                    <div className={errors.isAdminError ? 'text-amber-700 dark:text-amber-300' : ''}>
                      {errors.general}
                    </div>
                  </div>
                )}
                <div>
                  <Label>
                    Username or Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter username or email"
                    value={formData.identifier}
                    onChange={(e) => handleInputChange("identifier", e.target.value)}
                    error={!!errors.identifier}
                    hint={errors.identifier}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      error={!!errors.password}
                      hint={errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
