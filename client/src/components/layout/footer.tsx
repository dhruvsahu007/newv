import { Link } from "wouter";
import { Github, Twitter, Youtube } from "lucide-react";
import CodeIcon from "@/components/ui/code-icon";

const Footer = () => {
  return (
    <footer className="bg-[#111827] border-t border-gray-800 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/">
              <a className="flex items-center">
                <CodeIcon />
                <span className="ml-2 text-xl font-bold text-white">CodeCast</span>
              </a>
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/about">
              <a className="text-gray-400 hover:text-gray-300 text-sm">About</a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-gray-300 text-sm">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-400 hover:text-gray-300 text-sm">Terms of Service</a>
            </Link>
            <Link href="/contact">
              <a className="text-gray-400 hover:text-gray-300 text-sm">Contact Us</a>
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} CodeCast. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300"
            >
              <span className="sr-only">YouTube</span>
              <Youtube className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
