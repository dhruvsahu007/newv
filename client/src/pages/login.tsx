import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";
import CodeIcon from "@/components/ui/code-icon";

const Login = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md bg-[#1f2937] border-gray-700 text-gray-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CodeIcon className="text-3xl" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in to CodeCast</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-gray-400 text-center">
            <span>Don't have an account? </span>
            <Link href="/register">
              <a className="text-primary-500 hover:text-primary-400 font-medium">
                Sign up
              </a>
            </Link>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>Demo accounts:</p>
            <p>viewer/viewer123 | creator/creator123 | admin/admin123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
