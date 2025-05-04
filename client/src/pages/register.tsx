import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "@/components/auth/register-form";
import CodeIcon from "@/components/ui/code-icon";

const Register = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md bg-[#1f2937] border-gray-700 text-gray-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CodeIcon className="text-3xl" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-gray-400">
            Join CodeCast to watch, share, and learn from developer videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter>
          <div className="text-sm text-gray-400 text-center w-full">
            <span>Already have an account? </span>
            <Link href="/login">
              <a className="text-primary-500 hover:text-primary-400 font-medium">
                Sign in
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
