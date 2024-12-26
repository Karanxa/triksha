import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Triks</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;