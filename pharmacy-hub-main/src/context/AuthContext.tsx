import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { mockApi } from "@/services/api";
import { toast } from "react-hot-toast";

export type UserRole = "ADMIN" | "USER";
export type AuthUser = { name: string; role: UserRole };

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const role = localStorage.getItem("role") as UserRole | null;
    const name = localStorage.getItem("name");
    if (t && role && name) {
      setToken(t);
      setUser({ name, role });
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await mockApi.login(username, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("name", res.name);
      setToken(res.token);
      setUser({ name: res.name, role: res.role as UserRole });
      toast.success(`Welcome back, ${res.name}!`);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed";
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setToken(null);
    setUser(null);
    toast.success("Signed out");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
