import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pill, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/pharmacy-hero.png";

const Login = () => {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [creds, setCreds ] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(creds.username.trim(), creds.password);
      nav("/dashboard");
    } catch {
      // error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
      <div className="grid lg:grid-cols-2 h-screen">
        {/* Hero Left */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="hidden lg:flex flex-col items-center justify-center p-12 gap-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10" />
          <div className="text-center relative z-10 max-w-md">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl">
                <Pill className="h-8 w-8 text-teal-600" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">MediBill</h1>
            </div>
            <img src={heroImg} alt="Modern Pharmacy" className="w-96 h-64 object-cover rounded-3xl shadow-2xl mx-auto mb-8" />
            <div>
              <h2 className="text-2xl font-bold text-emerald-500 mb-4">Pharmacy Reimagined</h2>
              <p className="text-emerald-400 text-lg leading-relaxed">Streamlined billing, smart inventory, and insightful reports—all in one modern dashboard.</p>
            </div>
          </div>
        </motion.div>

        {/* Form Right */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex items-center justify-center p-8 lg:p-12"
        >
          <div className="w-full max-w-md">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              className="text-center mb-10"
            >
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Pill className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-3">Welcome Back</h1>
              <p className="text-gray-600 text-lg">Sign in to your pharmacy dashboard</p>
            </motion.div>

            <Card className="border-0 shadow-2xl ring-1 ring-slate-200/50 backdrop-blur-xl p-10 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={creds.username}
                      onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                      required
                      className="h-14 px-5 text-lg rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 hover:border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={creds.password}
                      onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                      required
                      className="h-14 px-5 text-lg rounded-2xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 hover:border-slate-300"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-white border-0"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-slate-50/50 rounded-2xl text-xs text-slate-600 text-center">
                <strong>For Use the Website:</strong> admin (admin) or create staff in dashboard.
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
