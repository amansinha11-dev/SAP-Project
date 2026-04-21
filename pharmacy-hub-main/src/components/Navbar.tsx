import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Pill, LogOut, ShoppingCart, LayoutDashboard, Users, Receipt, Package, BarChart3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); nav("/login"); };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/medicines", label: "Medicines", icon: Pill },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/billing", label: "Billing", icon: Receipt },
    ...(user?.role === "ADMIN" ? [
      { to: "/inventory", label: "Inventory", icon: Package },
      { to: "/reports", label: "Reports", icon: BarChart3 },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <NavLink to="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Pill className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="gradient-text">MediBill</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-primary text-primary-foreground shadow-md-soft" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink to="/billing" className="relative inline-flex">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {items.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-gradient-primary border-0">{items.length}</Badge>
            )}
          </NavLink>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="text-xs">
              <div className="font-semibold leading-tight">{user?.name}</div>
              <div className="text-muted-foreground leading-tight">{user?.role}</div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl" title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
