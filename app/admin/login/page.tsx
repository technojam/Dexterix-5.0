"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const initialState = {
  error: "",
};

function SubmitButton() {
     const { pending } = useFormStatus();
     return (
        <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-serif border-0" 
            type="submit" 
            disabled={pending}
        >
            {pending ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Logging in...
                 </>
            ) : "Log in"}
        </Button>
     );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000512] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-4 font-lora text-white">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@dexterix.com" 
                required 
                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50"
              />
            </div>
            
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
