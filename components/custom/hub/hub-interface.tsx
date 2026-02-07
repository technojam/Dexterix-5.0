"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarsBackground } from "@/components/ui/stars-bg";
import { toast } from "sonner";
import { Users, Trophy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  category: "Software" | "Hardware";
  maxLimit: number;
  _count: {
    teams: number;
  };
}

export interface Team {
  id: string;
  name: string;
}

export interface LeaderboardEntry {
    id: string;
    teamId: string;
    name: string;
    problemStatement: string;
    score: number;
}

export interface PageData {
  problems: ProblemStatement[];
  config: {
    canRegister: boolean;
    registrationOpenTime?: string | null;
    registrationCloseTime?: string | null;
    leaderboardColumns?: {
        rank: boolean;
        team: boolean;
        teamId: boolean;
        problem: boolean;
        score: boolean;
    };
  };
}

interface HubInterfaceProps {
  initialData: PageData;
  teams: Team[]; // Passed from server or fetched separately? Passed is better if small.
  leaderboard: LeaderboardEntry[];
}

export default function HubInterface({ initialData, teams, leaderboard }: HubInterfaceProps) {
  const router = useRouter();
  
  // Selection State
  const [selectedPs, setSelectedPs] = useState<ProblemStatement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form State
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");

  const handleSelect = (ps: ProblemStatement) => {
    if (!initialData?.config.canRegister) {
      toast.error("Registration is currently closed.");
      return;
    }
    const currentCount = ps._count?.teams || 0;
    if (currentCount >= ps.maxLimit) {
      toast.error("This problem statement is full.");
      return;
    }
    setSelectedPs(ps);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedTeamId || !leaderEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("/api/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemStatementId: selectedPs?.id,
          teamId: selectedTeamId,
          leaderEmail
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to register");

      toast.success("Team registered successfully!");
      setIsDialogOpen(false);
      router.refresh(); // Refresh Server Components
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setFormLoading(false);
    }
  };

  const cols = initialData.config.leaderboardColumns || { rank: true, team: true, teamId: false, problem: true, score: true };
  const colCount = Object.values(cols).filter(Boolean).length;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#000512]">
      <StarsBackground
        starDensity={0.0015}
        minTwinkleSpeed={1}
        className="absolute inset-0 z-0"
      />
      
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] sm:bg-[radial-gradient(ellipse_70%_45%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] md:bg-[radial-gradient(ellipse_80%_50%_at_5%_5%,rgba(27,42,128,5)_0%,rgba(27,52,148,0.3)_20%,transparent_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] sm:bg-[radial-gradient(ellipse_80%_35%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] md:bg-[radial-gradient(ellipse_90%_40%_at_90%_30%,rgba(36,69,134,0.6)_0%,rgba(36,49,134,0.3)_55%,transparent_95%)] pointer-events-none" />

      {/* Main Container */}
      <div className="container relative z-10 mx-auto pt-24 md:pt-32 pb-12 px-4 space-y-8 font-lora">
        <div className="flex flex-col gap-4 text-center items-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-lora italic drop-shadow-xl">
            Hackathon Hub
          </h1>
          <p className="text-muted-foreground/80 max-w-2xl text-lg font-lora">
            Manage your participation, select your challenge, and track your ranking.
          </p>
          {initialData.config.canRegister 
            ? <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20 font-lora px-4 py-1">Registration is Open</Badge> 
            : <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 font-lora px-4 py-1">Registration is Closed</Badge>
          }
        </div>

        <Tabs defaultValue="problems" className="w-full">
            <div className="flex justify-center mb-10">
                <TabsList className="grid w-full max-w-[400px] h-12 grid-cols-2 bg-secondary/20 border border-white/10 backdrop-blur-md rounded-full p-1">
                    <TabsTrigger value="problems" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-lora">Problem Statements</TabsTrigger>
                    <TabsTrigger value="leaderboard" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-lora">Leaderboard</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="problems" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialData.problems.map((ps) => {
                    const isFull = (ps._count?.teams || 0) >= ps.maxLimit;
                    return (
                        <Card key={ps.id} className="flex flex-col h-full bg-secondary/20 border-white/10 backdrop-blur-md hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-2">
                            <Badge variant={ps.category === "Hardware" ? "destructive" : "default"} className={`${ps.category === "Software" ? "bg-blue-600 hover:bg-blue-700" : ""} font-lora`}>
                                {ps.category}
                            </Badge>
                            <div className="flex items-center text-xs text-white/90 bg-black/40 px-3 py-1 rounded-full border border-white/10 font-mono">
                                <Users className="h-3 w-3 mr-2" />
                                {ps._count?.teams || 0} / {ps.maxLimit}
                            </div>
                            </div>
                            <CardTitle className="leading-tight mt-3 text-white font-lora text-xl">{ps.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-[10] font-sans leading-relaxed">{ps.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button 
                            className="w-full font-semibold font-lora" 
                            disabled={!initialData.config.canRegister || isFull}
                            variant={isFull ? "secondary" : "default"}
                            onClick={() => handleSelect(ps)}
                            >
                            {isFull ? "Full" : "Select Problem"}
                            </Button>
                        </CardFooter>
                        </Card>
                    );
                    })}
                    
                    {initialData.problems.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-secondary/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <p className="font-lora text-xl">No problem statements available.</p>
                            <p className="text-sm">Check back later for updates.</p>
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <Card className="bg-secondary/20 border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-white font-lora text-2xl flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            Live Rankings
                        </CardTitle>
                        <CardDescription className="font-lora">Real-time scores based on team performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto rounded-lg border border-white/10">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b [&_tr]:border-white/10 bg-white/5">
                                    <tr className="border-b transition-colors text-white">
                                        {cols.rank && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Rank</th>}
                                        {cols.team && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Team</th>}
                                        {cols.teamId && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Team ID</th>}
                                        {cols.problem && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Problem</th>}
                                        {cols.score && <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right font-lora">Score</th>}
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0 bg-transparent">
                                    {leaderboard.length > 0 ? (
                                        leaderboard.map((team, index) => (
                                            <tr key={team.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                                                {cols.rank && <td className="p-4 align-middle font-bold text-white font-mono text-lg">#{index + 1}</td>}
                                                {cols.team && <td className="p-4 align-middle text-white font-lora">{team.name}</td>}
                                                {cols.teamId && <td className="p-4 align-middle text-white/50 font-mono text-xs max-w-[100px] truncate" title={team.teamId}>{team.teamId}</td>}
                                                {cols.problem && <td className="p-4 align-middle text-gray-400 font-sans text-xs">{team.problemStatement}</td>}
                                                {cols.score && <td className="p-4 align-middle text-right font-mono text-primary font-bold text-lg">{team.score}</td>}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={colCount} className="h-32 text-center align-middle text-muted-foreground font-lora">
                                                No rankings available yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0a1120] border-white/10 text-white font-lora">
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
            <DialogDescription className="text-gray-400">
              You are about to select <strong>{selectedPs?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="teamId">Team ID</Label>
              <Input
                id="teamId"
                placeholder="Enter your Team ID"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="leaderEmail">Leader Email</Label>
                <Input
                    id="leaderEmail"
                    placeholder="Same email used for team registration"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    className="bg-black/20 border-white/10"
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
