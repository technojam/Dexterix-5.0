"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export interface UnregisteredTeam {
  id: string; // The cosmos ID, or teamId? Using teamId for display and ID for selection might be better, or just teamId if unique
  teamId: string; // Display ID e.g. T-101
  name: string;
}

export interface PageData {
  problems: ProblemStatement[];
  unregisteredTeams?: UnregisteredTeam[];
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
        leaderName?: boolean;
        leaderEmail?: boolean;
    };
    rankingTitle?: string;
  };
}

interface HubInterfaceProps {
  initialData: PageData;
  leaderboard: LeaderboardEntry[];
}

export default function HubInterface({ initialData, leaderboard }: HubInterfaceProps) {
  const router = useRouter();
  
  // Selection State
  const [selectedPs, setSelectedPs] = useState<ProblemStatement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDescDialogOpen, setIsDescDialogOpen] = useState(false);
  const [descPs, setDescPs] = useState<ProblemStatement | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [unregisteredTeams, setUnregisteredTeams] = useState<UnregisteredTeam[]>(initialData.unregisteredTeams || []);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [selectionLocked, setSelectionLocked] = useState(false);

  useEffect(() => {
    // Fetch unregistered teams client-side to ensure freshness and reliability
    const fetchTeams = async () => {
        setIsLoadingTeams(true);
        try {
            const res = await fetch('/api/teams/unregistered');
            if (res.ok) {
                const data = await res.json();
                // console.log("Fetched teams raw:", data);
                // Filter out teams that already have a problem statement
                // Also ensure they have an ID to select
                const validTeams = data.filter((t: any) => 
                    (!t.problemStatementId || t.problemStatementId === "") && t.id
                );
                // console.log("Valid unregistered teams:", validTeams);
                setUnregisteredTeams(validTeams);
            }
        } catch (error) {
            console.error("Failed to fetch teams client-side", error);
        } finally {
            setIsLoadingTeams(false);
        }
    };

    fetchTeams();
  }, []);
  
  // Form State
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const isOpenInnovation = selectedPs?.title.toLowerCase().includes("open innovation");

  const handleSelect = (ps: ProblemStatement) => {
    if (selectionLocked) {
      toast.error("This team has already selected a problem statement.");
      return;
    }
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
    setCustomTitle("");
    setCustomDescription("");
    setIsDialogOpen(true);
  };

  const handleReadMore = (ps: ProblemStatement) => {
    setDescPs(ps);
    setIsDescDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedTeamId || !leaderEmail || !leaderName) {
      toast.error("Please fill in all team details");
      return;
    }

    if (isOpenInnovation && (!customTitle || !customDescription)) {
        toast.error("Please provide your problem statement details");
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
          leaderEmail,
          leaderName,
          customTitle: isOpenInnovation ? customTitle : undefined,
          customDescription: isOpenInnovation ? customDescription : undefined
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to register");

      toast.success("Team registered successfully!");
      setSelectionLocked(true);
      setUnregisteredTeams((prev) => prev.filter((team) => team.id !== selectedTeamId));
      setSelectedTeamId("");
      setLeaderName("");
      setLeaderEmail("");
      setCustomTitle("");
      setCustomDescription("");
      setIsDialogOpen(false);
      router.refresh(); // Refresh Server Components
    } catch (error) {
      toast.error((error as Error).message || "Failed to register");
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
                <TabsList className="grid w-full max-w-[400px] h-12 grid-cols-2 bg-secondary/20 border border-white/10 backdrop-blur-md rounded-full p-1 items-stretch">
                    <TabsTrigger value="problems" className="!h-full rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-lora">Problem Statements</TabsTrigger>
                    <TabsTrigger value="leaderboard" className="!h-full rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-lora">Leaderboard</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="problems" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialData.problems.map((ps) => {
                    const isFull = (ps._count?.teams || 0) >= ps.maxLimit;
                    const isDisabled = selectionLocked || !initialData.config.canRegister || isFull;
                    return (
                        <Card key={ps.id} className="flex flex-col h-full bg-secondary/20 border-white/10 backdrop-blur-md hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex gap-2 items-center flex-wrap">
                                    <span className="text-xs font-mono font-bold bg-white/10 px-2 py-1 rounded-md text-white/80 border border-white/10 uppercase tracking-wider">{ps.id}</span>
                                    <Badge variant={ps.category === "Hardware" ? "destructive" : "default"} className={`${ps.category === "Software" ? "bg-blue-600 hover:bg-blue-700" : ""} font-lora`}>
                                        {ps.category}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-xs text-white/90 bg-black/40 px-3 py-1 rounded-full border border-white/10 font-mono whitespace-nowrap">
                                    <Users className="h-3 w-3 mr-2" />
                                    {ps._count?.teams || 0} / {ps.maxLimit}
                                </div>
                            </div>
                            <CardTitle className="leading-tight mt-3 text-white font-lora text-xl">{ps.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-[10] font-sans leading-relaxed">{ps.description}</p>
                            {ps.description.length > 280 && (
                                <Button
                                  type="button"
                                  variant="link"
                                  className="px-0 text-blue-300 hover:text-blue-200"
                                  onClick={() => handleReadMore(ps)}
                                >
                                  Read more
                                </Button>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button 
                            className="w-full font-semibold font-lora" 
                            disabled={isDisabled}
                            variant={isDisabled ? "secondary" : "default"}
                            onClick={() => handleSelect(ps)}
                            >
                            {selectionLocked ? "Selection Locked" : isFull ? "Full" : "Select Problem"}
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
                        <CardTitle className="text-white font-lora text-2xl flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-yellow-500" />
                                Live Rankings
                            </div>
                            {initialData.config.rankingTitle && (
                                <Badge variant="outline" className="ml-0 sm:ml-2 border-yellow-500/30 text-yellow-400 bg-yellow-500/5">
                                    {initialData.config.rankingTitle}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="font-lora">Real-time scores based on team performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto rounded-lg border border-white/10">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b [&_tr]:border-white/10 bg-white/5">
                                    <tr className="border-b transition-colors text-white">
                                        {cols.rank && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Rank</th>}
                                        {cols.teamId && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Team ID</th>}
                                        {cols.team && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Team</th>}
                                        {cols.leaderName && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Leader</th>}
                                        {cols.leaderEmail && <th className="h-12 px-4 align-middle font-medium text-muted-foreground font-lora">Email</th>}
                                        {cols.score && <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right font-lora">Score</th>}
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0 bg-transparent">
                                    {leaderboard.length > 0 ? (
                                        leaderboard.map((team, index) => (
                                            <tr key={team.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                                                {cols.rank && <td className="p-4 align-middle font-bold text-white font-mono text-lg">#{index + 1}</td>}
                                                {cols.teamId && <td className="p-4 align-middle text-slate-300 font-mono text-xs max-w-[120px] truncate" title={team.teamId}>{team.teamId}</td>}
                                                {cols.team && <td className="p-4 align-middle text-white font-lora">{team.name}</td>}
                                                {cols.leaderName && <td className="p-4 align-middle text-white/70 font-lora text-sm">{(team as any).leaderName || "N/A"}</td>}
                                                {cols.leaderEmail && <td className="p-4 align-middle text-white/50 font-mono text-xs max-w-[150px] truncate" title={(team as any).leaderEmail}>{(team as any).leaderEmail || "N/A"}</td>}
                                                {cols.score && <td className="p-4 align-middle text-right font-mono text-white font-bold text-lg">{team.score}</td>}
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

      <Dialog open={isDescDialogOpen} onOpenChange={setIsDescDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-[#0a1120] border-white/10 text-white font-lora">
          <DialogHeader>
            <DialogTitle className="text-white">{descPs?.title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {descPs?.id} · {descPs?.category} · {descPs?._count?.teams || 0} / {descPs?.maxLimit}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
            {descPs?.description}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#0a1120] border-white/10 text-white font-lora">
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
            <DialogDescription className="text-gray-400">
              You are about to select <strong>{selectedPs?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isOpenInnovation && (
                <>
                    <div className="grid gap-2">
                       <Label htmlFor="customTitle">Problem Title</Label>
                       <Input
                           id="customTitle"
                           placeholder="Your Problem Statement Title"
                           value={customTitle}
                           onChange={(e) => setCustomTitle(e.target.value)}
                           className="bg-black/20 border-white/10"
                       />
                    </div>
                    <div className="grid gap-2">
                       <Label htmlFor="customDescription">Problem Description</Label>
                       <textarea
                            id="customDescription"
                            placeholder="Describe your solution..."
                            className="flex h-20 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                        />
                    </div>
                </>
            )}
            <div className="grid gap-2">
              <Label htmlFor="teamId">Select Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white w-full h-10 font-lora">
                  <SelectValue placeholder="Select your team" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1120] border-white/10 text-white max-h-[200px] z-[150] font-lora">
                    {isLoadingTeams ? (
                         <SelectItem value="loading" disabled className="text-muted-foreground font-lora">Loading teams...</SelectItem>
                    ) : unregisteredTeams && unregisteredTeams.length > 0 ? (
                        unregisteredTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id} className="focus:bg-white/10 focus:text-white cursor-pointer font-lora">
                                <div className="flex items-center w-full">
                                    <span className="font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded text-xs mr-3 min-w-[60px] text-center border border-white/5">
                                        {team.teamId || team.id || "N/A"}
                                    </span>
                                    <span>{team.name}</span>
                                </div>
                            </SelectItem>
                        ))
                    ) : (
                         <SelectItem value="none" disabled className="text-muted-foreground font-lora">No eligible teams found</SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
               <Label htmlFor="leaderName">Leader Name</Label>
               <Input
                   id="leaderName"
                   placeholder="Full Name of Team Leader"
                   value={leaderName}
                   onChange={(e) => setLeaderName(e.target.value)}
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
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
            <Button 
                variant="outline" 
                className="w-full sm:flex-1 bg-transparent border-white/10 hover:bg-white/10 text-white hover:text-white" 
                onClick={() => setIsDialogOpen(false)} 
                disabled={formLoading}
            >
                Cancel
            </Button>
            <Button 
                onClick={handleSubmit} 
                disabled={formLoading} 
                className="w-full sm:flex-1 bg-white text-black hover:bg-white/90"
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
