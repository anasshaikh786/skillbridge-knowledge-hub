import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "store/auth";
import { Button } from "components/ui/button";
import { ShoppingCart, Heart, LogOut, User, BookOpen, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "components/ui/avatar";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090B]/85 border-b border-zinc-800/50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="h-8 w-8 rounded-lg bg-[#FFD60A] grid place-items-center">
            <BookOpen className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display font-black text-xl tracking-tight">
            Skill<span className="text-[#FFD60A]">Bridge</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors" data-testid="nav-home">Home</Link>
          <Link to="/catalog" className="text-zinc-400 hover:text-white transition-colors" data-testid="nav-catalog">Catalog</Link>
          {user?.role === "Instructor" && (
            <Link to="/dashboard/instructor" className="text-zinc-400 hover:text-white transition-colors" data-testid="nav-instructor">Teach</Link>
          )}
          <a href="#about" className="text-zinc-400 hover:text-white transition-colors">About</a>
        </div>

        <div className="flex items-center gap-3">
          {token && (
            <>
              <Link to="/wishlist" className="hidden sm:grid place-items-center h-9 w-9 rounded-full hover:bg-zinc-900 transition-colors" data-testid="nav-wishlist">
                <Heart className="h-4 w-4 text-zinc-300" />
              </Link>
              <Link to="/cart" className="hidden sm:grid place-items-center h-9 w-9 rounded-full hover:bg-zinc-900 transition-colors" data-testid="nav-cart">
                <ShoppingCart className="h-4 w-4 text-zinc-300" />
              </Link>
            </>
          )}

          {!token ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900" data-testid="nav-login">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-semibold" data-testid="nav-signup">Sign Up</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-testid="nav-user-menu">
                <button className="rounded-full outline-none focus:ring-2 focus:ring-[#FFD60A]">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-zinc-800 text-white">{user?.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#121214] border-zinc-800 text-zinc-100 min-w-48">
                <DropdownMenuLabel>{user?.firstName} {user?.lastName}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                  <Link to="/dashboard" data-testid="menu-dashboard"><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</Link>
                </DropdownMenuItem>
                {user?.role === "Instructor" && (
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                    <Link to="/dashboard/instructor" data-testid="menu-instructor">Instructor</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                  <Link to="/profile" data-testid="menu-profile"><User className="h-4 w-4 mr-2" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={onLogout} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer" data-testid="menu-logout">
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
