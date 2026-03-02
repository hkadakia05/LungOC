import { Activity, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { AuthButtons } from "./AuthButtons";

export function Header() {
  return (
    <header className="bg-white border-b-2 border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-blue-900 font-bold text-xl">MediScan AI</h1>
              <p className="text-blue-500 text-xs">Lung Cancer Detection</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors">
              Home
            </a>
            <a href="#" className="text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors">
              About
            </a>
            <a href="#" className="text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors">
              How It Works
            </a>
            <a href="#" className="text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors">
              Contact
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex">
              <AuthButtons />
            </div>
            <Button className="md:hidden bg-blue-600 hover:bg-blue-700">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
