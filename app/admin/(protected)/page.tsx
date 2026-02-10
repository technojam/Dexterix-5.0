"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { StarsBackground } from "@/components/ui/stars-bg";
import { Search, Loader2, Save, Upload, Plus, Settings, Calendar, Layers, LogOut, Trash2, ArrowRight, LayoutDashboard, Edit, Download } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Member {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  course?: string;
  year?: string;
  [key: string]: any;
}

interface Team {
  id: string;
  name: string;
  leaderName?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  members: Member[];
  college?: string;
  year?: string;
  checkedIn?: boolean;
  tableNumber?: string | number;
  psId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ProblemStatement {
  id: string;
  title: string;
  description?: string;
  domain?: string;
  maxLimit?: number;
  category?: string;
  _count?: { teams: number };
  [key: string]: any;
}

interface AdminSettings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}


export default function AdminPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Leaderboard Upload
  const [scoreFile, setScoreFile] = useState<File | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  // Teams Data
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Problem Statement Form
  const [psId, setPsId] = useState("");
  const [psTitle, setPsTitle] = useState("");
  const [psDesc, setPsDesc] = useState("");
  const [psDomain, setPsDomain] = useState("");
  const [psLimit, setPsLimit] = useState(10);
  const [psCategory, setPsCategory] = useState("Software");
  const [psLoading, setPsLoading] = useState(false);
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);

  // Edit PS State
  const [editingPs, setEditingPs] = useState<ProblemStatement | null>(null);
  const [editPsOpen, setEditPsOpen] = useState(false);

  // Settings Form
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => toast.error("Failed to load settings"));

    fetchTeams();
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
      try {
          const res = await fetch("/api/hub?admin=true"); // Fetch all for admin
          const data = await res.json();
          if(data.problems) setProblemStatements(data.problems);
      } catch {
          console.error("Failed to fetch PS");
      }
  };

  const fetchTeams = async () => {
      setTeamsLoading(true);
      try {
          const res = await fetch("/api/admin/teams");
          const data = await res.json();
          if (res.ok) {
              setTeams(data.teams || []);
              if (data.role) setUserRole(data.role);
          }
      } catch {
          toast.error("Failed to load teams");
      } finally {
          setTeamsLoading(false);
      }
  };

  const saveTeamUpdates = async () => {
      if (!editingTeam) return;
      try {
          const method = editingTeam.id ? "PATCH" : "POST";
          const res = await fetch("/api/admin/teams", {
              method: method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(editingTeam)
          });
          
          if (res.ok) {
              toast.success(`Team ${method === "POST" ? "Created" : "Updated"}`);
              setEditDialogOpen(false);
              setEditingTeam(null);
              fetchTeams(); // Refresh data
          } else {
              const data = await res.json();
              toast.error(data.error || "Update failed");
          }
      } catch {
          toast.error("Network error");
      }
  };

  const logout = async () => {
    try {
        await logoutAction();
        router.push("/admin/login");
    } catch {
        toast.error("Logout failed");
    }
  };

  const deleteTeam = async (id: string) => {
      if (!confirm("Are you sure you want to delete this team?")) return;
      try {
          const res = await fetch(`/api/admin/teams?id=${id}`, { method: "DELETE" });
          if (res.ok) {
              toast.success("Team deleted");
              fetchTeams();
          } else {
              toast.error("Failed to delete team");
          }
      } catch {
          toast.error("Error deleting team");
      }
  };

  const clearAllTeams = async () => {
      if (!confirm("CRITICAL: This will delete ALL teams. Are you sure?")) return;
      try {
          const res = await fetch(`/api/admin/teams?all=true`, { method: "DELETE" });
          if (res.ok) {
              toast.success("All teams deleted");
              fetchTeams();
          } else {
              toast.error("Failed to clear teams");
          }
      } catch {
          toast.error("Error clearing teams");
      }
  };

  const resetCheckIns = async () => {
      if (!confirm("Are you sure you want to RESET all check-ins? check-in status and table assignments will be wiped.")) return;
       try {
          const res = await fetch("/api/admin/checkin/reset", { method: "POST" });
          if (res.ok) {
              toast.success("Check-ins reset successfully");
              fetchTeams();
          } else {
              toast.error("Failed to reset check-ins");
          }
      } catch {
          toast.error("Network error during reset");
      } 
  };

  const manuallyCheckout = async (team: Team) => {
        if (!confirm(`Force checkout for team ${team.name}? Table ${team.tableNumber} will be freed.`)) return;
        try {
            const res = await fetch("/api/admin/checkin", { 
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId: team.id, status: false })
            });

            if (res.ok) {
                toast.success(`Team ${team.name} checked out`);
                fetchTeams();
            } else {
                toast.error("Failed to checkout team");
            }
        } catch {
            toast.error("Error checking out");
        }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadCsv = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Imported ${data.count} teams`, {
            description: data.skipped > 0 ? `${data.skipped} duplicates skipped.` : undefined
        });
        setFile(null);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const exportTeams = () => {
      if (!teams.length) {
          toast.error("No teams to export");
          return;
      }
      
      const headers = ["Team ID", "Team Name", "Leader Name", "Leader Email", "Phone", "College", "Member Count", "Problem Statement", "Checked In", "Table"];
      const csvContent = [
          headers.join(","),
          ...teams.map(t => [
              t.teamId || t.id, // Prefer display ID
              `"${(t.name || "").replace(/"/g, '""')}"`,
              `"${(t.leaderName || "").replace(/"/g, '""')}"`,
              t.leaderEmail || "",
              t.phone || "",
              `"${(t.college || "").replace(/"/g, '""')}"`,
              (t.members || []).length,
              t.problemStatementId || "N/A",
              t.checkedIn ? "Yes" : "No",
              t.tableNumber || ""
          ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `teams_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const createPS = async () => {
    if (!psTitle || !psDesc) {
        toast.error("Please fill in required fields");
        return;
    }
    setPsLoading(true);
    try {
        const res = await fetch("/api/hub", {
            method: "POST",
            body: JSON.stringify({ 
                id: psId, 
                title: psTitle, 
                description: psDesc, 
                maxLimit: psLimit, 
                category: psCategory,
                domain: psDomain 
            }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            toast.success("Problem Statement Created");
            setPsId(""); 
            setPsTitle("");
            setPsDesc("");
            setPsDomain("");
            fetchProblems();
        } else {
            const json = await res.json();
            toast.error(json.error || "Failed is create problem statement");
        }
    } catch {
        toast.error("Network error");
    } finally {
        setPsLoading(false);
    }
  };

  const deletePs = async (id: string) => {
      if(!confirm("Are you sure you want to delete this Problem Statement?")) return;
      try {
          // Assuming we have a DELETE endpoint for PS. If not, we need one.
          // Using a generic way or dedicated route.
          const res = await fetch(`/api/admin/problems?id=${id}`, { method: "DELETE" });
          if(res.ok) {
              toast.success("Problem statement deleted");
              fetchProblems();
          } else {
              toast.error("Failed to delete");
          }
      } catch {
          toast.error("Error deleting PS");
      }
  };

  const openEditPs = (ps: ProblemStatement) => {
      setEditingPs(ps);
      setEditPsOpen(true);
  };

  const updatePs = async () => {
    if (!editingPs) return;
    setPsLoading(true);
    try {
        // Using POST for create/update if the backend supports upsert, otherwise we need PUT/PATCH
        // Assuming current /api/hub handles upsert based on ID or we can modify it
        const res = await fetch("/api/hub", {
            method: "POST", // Re-using POST for now, assuming upsert logic or will modify route
            body: JSON.stringify({ 
                id: editingPs.id, 
                title: editingPs.title, 
                description: editingPs.description, 
                maxLimit: editingPs.maxLimit, 
                category: editingPs.category,
                domain: editingPs.domain 
            }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            toast.success("Problem Statement Updated");
            setEditPsOpen(false);
            setEditingPs(null);
            fetchProblems();
        } else {
            const json = await res.json();
            toast.error(json.error || "Update failed");
        }
    } catch {
        toast.error("Network error");
    } finally {
        setPsLoading(false);
    }
  };

  const unassignTeamFromPs = async (team: Team) => {
      if(!confirm(`Unassign team ${team.name} from current problem statement?`)) return;
      try {
          const res = await fetch("/api/admin/checkin", {
              method: "PATCH",
              body: JSON.stringify({ teamId: team.id, problemStatementId: null }), // Null clears it
              headers: { "Content-Type": "application/json" }
          });
           if (res.ok) {
                toast.success(`Team unassigned from PS`);
                fetchTeams();
            } else {
                toast.error("Failed to unassign");
            }
      } catch {
          toast.error("Operation failed");
      }
  };

  const updateSettings = async () => {
    setSettingsLoading(true);
    try {
        const res = await fetch("/api/settings", {
            method: "POST",
            body: JSON.stringify(settings),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            toast.success("Settings Updated Successfully");
        } else {
            toast.error("Failed to update settings");
        }
    } catch {
        toast.error("Error saving settings");
    } finally {
        setSettingsLoading(false);
    }
  };

  const toggleColumn = (key: string) => {
      setSettings((prev) => {
          if (!prev) return prev;
          return {
              ...prev,
              leaderboardColumns: {
                  ...prev.leaderboardColumns,
                  [key]: !prev.leaderboardColumns?.[key]
              }
          };
      });
  };
  
  const toggleSetting = (key: string) => {
      setSettings((prev) => {
          if (!prev) return prev;
          return {
              ...prev,
              [key]: !prev[key]
          };
      });
  };

  const updateDateTime = (settingKey: string, type: 'date' | 'time', value: string) => {
    if (!settings) return;
    const currentStr = settings[settingKey] || new Date().toISOString();
    let date = new Date(currentStr);
    if (isNaN(date.getTime())) date = new Date();

    // Convert to IST (UTC + 5:30) to work with the user's intended time
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffsetMs);

    let y = istDate.getUTCFullYear();
    let m = istDate.getUTCMonth();
    let d = istDate.getUTCDate();
    let h = istDate.getUTCHours();
    let min = istDate.getUTCMinutes();

    if (type === 'date') {
        // value is YYYY-MM-DD
        const [ny, nm, nd] = value.split('-').map(Number);
        y = ny;
        m = nm - 1;
        d = nd;
    } else {
        // value is HH:MM
        const [nh, nmin] = value.split(':').map(Number);
        h = nh;
        min = nmin;
    }

    // Create timestamp treating components as UTC, then subtract offset to get real UTC
    const newIstAsUtc = Date.UTC(y, m, d, h, min);
    const newRealUtc = newIstAsUtc - istOffsetMs;

    setSettings({ ...settings, [settingKey]: new Date(newRealUtc).toISOString() });
  };

  const getDateValue = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    
    // Display as IST
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffsetMs);
    
    const y = istDate.getUTCFullYear();
    const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(istDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getTimeValue = (isoString: string) => {
     if (!isoString) return "";
     const date = new Date(isoString);
     if (isNaN(date.getTime())) return "";

     // Display as IST
     const istOffsetMs = 5.5 * 60 * 60 * 1000;
     const istDate = new Date(date.getTime() + istOffsetMs);

     const h = String(istDate.getUTCHours()).padStart(2, '0');
     const m = String(istDate.getUTCMinutes()).padStart(2, '0');
     return `${h}:${m}`;
  };

  const handleScoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScoreFile(e.target.files[0]);
    }
  };

  const uploadScores = async () => {
    if (!scoreFile) return;
    setScoreLoading(true);
    const formData = new FormData();
    formData.append("file", scoreFile);

    try {
      const res = await fetch("/api/admin/leaderboard/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Updated ${data.updated} teams`, {
            description: data.errors.length > 0 ? (
                <div className="max-h-[100px] overflow-y-auto text-xs mt-1 text-red-300">
                    {data.errors.map((e: string, i: number) => <div key={i}>{e}</div>)}
                </div>
            ) : undefined,
            duration: 5000
        });
        setScoreFile(null);
        // Reset file input value if possible, or reliance on key change/re-render
        fetchTeams(); 
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setScoreLoading(false);
    }
  };

  if (!settings && !loading) {
      // Allow initial load
  }

  return (
    <div className="relative min-h-screen w-full text-white font-lora">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#000512]">
            <StarsBackground starDensity={0.0005} minTwinkleSpeed={2} className="absolute inset-0 opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        </div>
        
        <div className="relative z-10 container mx-auto py-24 px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-lg">Manage hackathon configuration, problem statements, and participant data from a centralized control center.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                     <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 md:flex-none bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all shadow-lg shadow-black/20" 
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                     <Link href="/admin/checkin" className="flex-1 md:flex-none">
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full bg-blue-600/20 border-blue-500/30 text-blue-200 hover:bg-blue-600/30 transition-all"
                        >
                            Volunteer Mode <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                     </Link>
                     <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 md:flex-none bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all shadow-lg shadow-black/20" 
                        onClick={fetchTeams}
                    >
                        Refresh Data
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Global Settings */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 lg:col-span-2 shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Settings className="h-5 w-5 text-blue-400" />
                             </div>
                             <div>
                                <CardTitle className="text-xl text-white">Global Configuration</CardTitle>
                                <CardDescription className="text-slate-400">Control feature visibility and hackathon timelines.</CardDescription>
                             </div>
                        </div>
                    </CardHeader>
                    {settings && (
                    <CardContent className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* General Toggles */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Visibility Controls
                                </h3>
                                <div className="bg-black/20 rounded-xl p-4 space-y-3 border border-white/5">
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 pb-3 mb-2 gap-4">
                                        <Label htmlFor="registrationEnabled" className="cursor-pointer flex-1 min-w-0 flex flex-col">
                                            <span className="font-semibold text-green-400 break-words whitespace-normal">Master Registration Toggle</span>
                                            <span className="text-xs text-slate-500 font-normal break-words whitespace-normal mt-1">Must be ON for registration to open (syncs with Time Window).</span>
                                        </Label>
                                        <input 
                                            type="checkbox" 
                                            id="registrationEnabled"
                                            checked={settings.registrationEnabled || false}
                                            onChange={() => toggleSetting('registrationEnabled')}
                                            className="h-5 w-5 rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors gap-4">
                                        <Label htmlFor="showHardware" className="cursor-pointer flex-1 min-w-0 text-white break-words whitespace-normal">Show Hardware Problems</Label>
                                        <input 
                                            type="checkbox" 
                                            id="showHardware"
                                            checked={settings.showHardware || false}
                                            onChange={() => toggleSetting('showHardware')}
                                            className="h-5 w-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors gap-4">
                                        <Label htmlFor="showSoftware" className="cursor-pointer flex-1 min-w-0 text-white break-words whitespace-normal">Show Software Problems</Label>
                                        <input 
                                            type="checkbox" 
                                            id="showSoftware"
                                            checked={settings.showSoftware || false}
                                            onChange={() => toggleSetting('showSoftware')}
                                            className="h-5 w-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors gap-4">
                                        <Label htmlFor="volunteersCanEdit" className="cursor-pointer flex-1 min-w-0 flex flex-col">
                                            <span className="text-white break-words whitespace-normal">Volunteers Can Edit Teams</span>
                                            <span className="text-xs text-slate-500 font-normal mt-1">Allow volunteers to modify participant details.</span>
                                        </Label>
                                        <input 
                                            type="checkbox" 
                                            id="volunteersCanEdit"
                                            checked={settings.volunteersCanEditTeams || false}
                                            onChange={() => toggleSetting('volunteersCanEditTeams')}
                                            className="h-5 w-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 flex-shrink-0"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Timelines */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                     <Calendar className="h-4 w-4" /> Registration Window (IST)
                                </h3>
                                <div className="bg-black/20 rounded-xl p-4 space-y-4 border border-white/5">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-white">Opens At</Label>
                                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                            <Input 
                                                type="date"
                                                value={getDateValue(settings.registrationOpenTime)}
                                                onChange={(e) => updateDateTime('registrationOpenTime', 'date', e.target.value)}
                                                className="bg-white/5 border-white/10 text-white w-full sm:flex-1 [color-scheme:dark]"
                                            />
                                            <Input 
                                                type="time"
                                                value={getTimeValue(settings.registrationOpenTime)}
                                                onChange={(e) => updateDateTime('registrationOpenTime', 'time', e.target.value)}
                                                className="bg-white/5 border-white/10 text-white w-full sm:w-32 [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-white">Closes At</Label>
                                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                            <Input 
                                                type="date"
                                                value={getDateValue(settings.registrationCloseTime)}
                                                onChange={(e) => updateDateTime('registrationCloseTime', 'date', e.target.value)}
                                                className="bg-white/5 border-white/10 text-white w-full sm:flex-1 [color-scheme:dark]"
                                            />
                                            <Input 
                                                type="time"
                                                value={getTimeValue(settings.registrationCloseTime)}
                                                onChange={(e) => updateDateTime('registrationCloseTime', 'time', e.target.value)}
                                                className="bg-white/5 border-white/10 text-white w-full sm:w-32 [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capacity Config */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Event Capacity</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                     <Label className="text-xs text-slate-400">Total Tables Available</Label>
                                     <Input 
                                         type="number"
                                         value={settings.totalTables || 100}
                                         onChange={(e) => setSettings({...settings, totalTables: parseInt(e.target.value)})}
                                         className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                                     />
                                     <p className="text-[10px] text-slate-500">
                                         Used for auto-assigning seating during check-in using a greedy algorithm.
                                     </p>
                                 </div>
                             </div>
                        </div>

                         {/* Leaderboard Config */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Leaderboard Configuration</h3>
                                <Button 
                                    size="sm" 
                                    variant="destructive"
                                    className="h-7 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                    onClick={async () => {
                                        if(!confirm("Are you sure you want to RESET the Leaderboard? All scores will be removed.")) return;
                                        try {
                                            const res = await fetch("/api/admin/leaderboard/reset", { method: "POST" });
                                            if(res.ok) toast.success("Leaderboard Reset");
                                            else toast.error("Failed to reset");
                                        } catch { toast.error("Network Error"); }
                                    }}
                                >
                                    Reset Rankings
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Ranking Title</Label>
                                <Input 
                                    value={settings.rankingTitle || ""}
                                    onChange={(e) => setSettings({...settings, rankingTitle: e.target.value})}
                                    placeholder="e.g. Round 1 Evaluation"
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>

                            <Label className="text-xs text-slate-400 mt-2 block">Visible Columns</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {['rank', 'team', 'teamId', 'leaderName', 'leaderEmail', 'score'].map((key) => (
                                    <label key={key} className={`
                                        flex items-center justify-center p-3 rounded-lg border border-dashed cursor-pointer transition-all duration-300 text-sm
                                        ${settings.leaderboardColumns?.[key] 
                                            ? 'bg-blue-500/10 border-blue-500/40 text-blue-200' 
                                            : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'}
                                    `}>
                                        <input 
                                            type="checkbox" 
                                            checked={!!settings.leaderboardColumns?.[key]}
                                            onChange={() => toggleColumn(key)}
                                            className="hidden"
                                        />
                                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm">Update Scores</h4>
                                        <p className="text-[10px] text-slate-500">Upload CSV/Excel with 'Team ID' and 'Score' columns.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center w-full md:w-auto">
                                     <div className="relative group flex-1 md:w-64">
                                        <div className={`
                                            absolute inset-0 bg-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity
                                            ${scoreFile ? 'opacity-50' : ''}
                                        `} />
                                        <div className="relative flex items-center justify-center border border-dashed border-white/20 rounded-lg px-4 py-2 hover:bg-white/5 cursor-pointer transition-all">
                                            <span className="text-xs text-slate-300 truncate max-w-[200px]">
                                                {scoreFile ? scoreFile.name : "Select Score File"}
                                            </span>
                                            <Input 
                                                type="file" 
                                                accept=".csv,.xlsx" 
                                                onChange={handleScoreFileChange} 
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            />
                                        </div>
                                     </div>
                                    <Button 
                                        onClick={uploadScores}
                                        disabled={!scoreFile || scoreLoading}
                                        size="sm"
                                        className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/20"
                                    >
                                        {scoreLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    )}
                    <CardFooter className="bg-black/20 p-4 border-t border-white/5 flex justify-end rounded-b-xl">
                        <Button 
                            onClick={updateSettings} 
                            disabled={settingsLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20"
                        >
                            {settingsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Configuration
                        </Button>
                    </CardFooter>
                </Card>

                {/* Team Management */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 lg:col-span-2 shadow-2xl">
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <Layers className="h-5 w-5 text-orange-400" />
                             </div>
                             <div>
                                <CardTitle className="text-xl text-white">Team Management</CardTitle>
                                <CardDescription className="text-slate-400">Manage registered teams.</CardDescription>
                             </div>
                         </div>
                         <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={clearAllTeams}
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 flex-1 md:flex-none"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear All Teams
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={resetCheckIns}
                                className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 flex-1 md:flex-none"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Reset Check-ins
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={exportTeams}
                                className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 flex-1 md:flex-none"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mb-4">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by team name, ID, or leader..."
                                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="rounded-md border border-white/10 overflow-hidden">
                            {/* Table Header - Hidden on Mobile */}
                            <div className="hidden md:grid bg-white/5 p-3 grid-cols-12 gap-4 text-sm font-medium text-slate-300">
                                <div className="col-span-2">ID</div>
                                <div className="col-span-2">Team</div>
                                <div className="col-span-2">PS</div>
                                <div className="col-span-1">Table</div>
                                <div className="col-span-3">Contact</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>
                            
                            <div className="max-h-[600px] overflow-y-auto">
                                {teamsLoading ? (
                                    <div className="p-8 text-center text-slate-500 flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : teams.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">No teams found. Import CSV to get started.</div>
                                ) : (
                                    teams
                                    .filter(team => {
                                        if (!searchTerm) return true;
                                        const lowerTerm = searchTerm.toLowerCase();
                                        return (
                                            team.name?.toLowerCase().includes(lowerTerm) ||
                                            (team.teamId && team.teamId.toLowerCase().includes(lowerTerm)) ||
                                            (team.id && team.id.toLowerCase().includes(lowerTerm)) ||
                                            team.leaderName?.toLowerCase().includes(lowerTerm) ||
                                            String(team.phone || "").includes(searchTerm)
                                        );
                                    })
                                    .map((team, idx) => (
                                        <div key={team.id || idx} className="p-4 md:p-3 border-t border-white/5 hover:bg-white/5 transition-colors flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center">
                                            
                                            {/* Mobile: Top Row (Name + Status) */}
                                            <div className="flex md:hidden w-full justify-between items-center">
                                                <div className="font-medium text-white truncate text-base">
                                                    {team.name}
                                                </div>
                                                <div className="flex gap-2">
                                                    {team.checkedIn && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">CHECKED IN</span>}
                                                    {team.tableNumber && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full font-mono">#{team.tableNumber}</span>}
                                                </div>
                                            </div>

                                            {/* ID */}
                                            <div className="col-span-2 font-mono text-xs text-slate-500 md:text-slate-200 break-all md:break-words w-full" title={team.id}>
                                                <span className="md:hidden uppercase text-[10px] text-slate-600 font-bold mr-2">ID:</span>
                                                {team.id}
                                            </div>

                                            {/* Desktop: Team Name */}
                                            <div className="hidden md:block col-span-2 truncate font-medium text-slate-200">
                                                {team.name}
                                                {team.checkedIn && <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded">IN</span>}
                                            </div>

                                            {/* PS */}
                                            <div className="col-span-2 w-full" title={team.problemStatementId || "No PS Selected"}>
                                                <span className="md:hidden uppercase text-[10px] text-slate-600 font-bold mr-2">PS:</span>
                                                {team.problemStatementId ? (
                                                    <span className="text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded text-xs">{team.problemStatementId}</span>
                                                ) : <span className="text-slate-500 text-xs">-</span>}
                                            </div>

                                            {/* Desktop: Table */}
                                            <div className="hidden md:block col-span-1 truncate text-xs font-mono text-yellow-400">
                                                {team.tableNumber ? `#${team.tableNumber}` : "-"}
                                            </div>

                                            {/* Contact */}
                                            <div className="col-span-3 text-xs text-slate-400 w-full">
                                                <div className="font-medium text-slate-200 truncate">{team.leaderName}</div>
                                                <div className="truncate">{team.leaderEmail}</div>
                                                <div className="opacity-50 truncate">{team.college}</div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="col-span-2 flex justify-start md:justify-end gap-2 w-full mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                                                {team.problemStatementId && (
                                                     <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 md:size-icon text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 bg-yellow-500/5 md:bg-transparent"
                                                        onClick={() => unassignTeamFromPs(team)}
                                                        title="Unassign Problem Statement"
                                                     >
                                                         <Settings className="h-3 w-3 mr-2 md:mr-0" />
                                                         <span className="md:hidden">Unassign PS</span>
                                                     </Button>
                                                )}
                                                 {team.checkedIn && (
                                                     <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                                        onClick={() => manuallyCheckout(team)}
                                                        title="Force Checkout / Undo Check-in"
                                                     >
                                                         <LogOut className="h-3 w-3" />
                                                     </Button>
                                                 )}
                                                <Button 
                                                    variant="ghost"  
                                                    size="icon" 
                                                    onClick={() => deleteTeam(team.id)}
                                                    className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                {userRole === "admin" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"
                                                        onClick={() => {
                                                            setEditingTeam({...team});
                                                            setEditDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Left Column: Import */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                         <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                <Upload className="h-5 w-5 text-green-400" />
                             </div>
                             <CardTitle className="text-white">Import Teams</CardTitle>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                setEditingTeam({ id: "", name: "", members: [] });
                                setEditDialogOpen(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Manual Team
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6 flex flex-col flex-1">
                        <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors group cursor-pointer relative min-h-[200px]">
                             <Input 
                                id="csv" 
                                type="file" 
                                accept=".csv,.xlsx,.xls" 
                                onChange={handleFileChange} 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full" 
                            />
                            <div className="p-4 bg-white/5 rounded-full mb-3 group-hover:bg-white/10 transition-colors">
                                <Upload className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-200">
                                {file ? file.name : "Drag & drop or Click to upload Excel/CSV"}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                                Columns: <br/>
                                <span className="text-slate-300">Team ID, Team Name, Team Leader Name, Email, College, Year</span>
                            </p>
                        </div>
                        <Button 
                            onClick={uploadCsv} 
                            disabled={loading || !file}
                            className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/20 mt-auto"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Process Import
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Column: Add PS */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full">
                    <CardHeader>
                         <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <Plus className="h-5 w-5 text-purple-400" />
                             </div>
                             <CardTitle className="text-white">New Problem Statement</CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Problem Code/ID</Label>
                                <Input 
                                    value={psId} 
                                    onChange={(e) => setPsId(e.target.value)} 
                                    placeholder="e.g. PS01" 
                                    className="bg-black/20 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50" 
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="text-xs text-slate-400">Title</Label>
                                <Input 
                                    value={psTitle} 
                                    onChange={(e) => setPsTitle(e.target.value)} 
                                    placeholder="e.g. AI for Social Good" 
                                    className="bg-black/20 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Domain</Label>
                            <Input 
                                value={psDomain} 
                                onChange={(e) => setPsDomain(e.target.value)} 
                                placeholder="e.g. Machine Learning, Web3, IoT" 
                                className="bg-black/20 border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Category</Label>
                                <div className="relative">
                                    <select 
                                        value={psCategory} 
                                        onChange={(e) => setPsCategory(e.target.value)} 
                                        className="w-full h-10 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                                    >
                                        <option value="Software" className="bg-slate-900">Software</option>
                                        <option value="Hardware" className="bg-slate-900">Hardware</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Max Teams</Label>
                                <Input 
                                    type="number" 
                                    value={psLimit} 
                                    onChange={(e) => setPsLimit(Number(e.target.value))} 
                                    className="bg-black/20 border-white/10 text-slate-200 focus:border-purple-500/50 [color-scheme:dark]" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Description</Label>
                            <textarea
                                value={psDesc} 
                                onChange={(e) => setPsDesc(e.target.value)} 
                                placeholder="Detailed description of the challenge..." 
                                className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        
                        <Button 
                            onClick={createPS}
                            disabled={psLoading}
                            className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/20"
                        >
                            {psLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Publish to Hub
                        </Button>
                    </CardContent>
                </Card>

                {/* Existing Problem Statements List */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full lg:col-span-2">
                    <CardHeader>
                         <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <LayoutDashboard className="h-5 w-5 text-blue-400" />
                             </div>
                             <CardTitle className="text-white">Active Problem Statements</CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-white/10 overflow-hidden">
                            <div className="hidden md:grid bg-white/5 p-3 grid-cols-12 gap-4 text-sm font-medium text-white">
                                <div className="col-span-2">ID</div>
                                <div className="col-span-3">Title</div>
                                <div className="col-span-2">Domain</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-2">Limit</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {problemStatements.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">No problem statements created yet.</div>
                                ) : (
                                    problemStatements.map((ps) => (
                                        <div key={ps.id} className="p-4 md:p-3 border-t border-white/5 hover:bg-white/5 transition-colors flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center">
                                            {/* Mobile Header */}
                                            <div className="flex md:hidden w-full justify-between items-start mb-1">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300 w-fit mb-1">{ps.id.substring(0,8)}</span>
                                                    <span className="font-medium text-white text-base">{ps.title}</span>
                                                </div>
                                                 <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={() => deletePs(ps.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Desktop Items */}
                                            <div className="hidden md:block col-span-2 font-mono text-xs text-white">{ps.id.substring(0,8)}</div>
                                            <div className="hidden md:block col-span-3 truncate font-medium text-white" title={ps.title}>{ps.title}</div>
                                            
                                            {/* Domain */}
                                            <div className="col-span-2 truncate text-xs w-full text-white">
                                                <span className="md:hidden uppercase text-[10px] text-slate-500 font-bold mr-2">Domain:</span>
                                                {ps.domain}
                                            </div>

                                            {/* Category */}
                                            <div className="col-span-2">
                                                <span className="md:hidden uppercase text-[10px] text-slate-500 font-bold mr-2">Category:</span>
                                                <span className={`text-xs px-2 py-0.5 rounded border ${
                                                    ps.category === 'Hardware' 
                                                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
                                                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                                }`}>
                                                    {ps.category}
                                                </span>
                                            </div>

                                            {/* Limit */}
                                            <div className="col-span-2 text-xs text-white">
                                                <span className="md:hidden uppercase text-[10px] text-slate-500 font-bold mr-2">Teams:</span>
                                                <span className="text-white">{ps._count?.teams || 0}</span> / {ps.maxLimit}
                                            </div>

                                            {/* Desktop Action */}
                                            <div className="hidden md:block col-span-1 text-right flex justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                    onClick={() => openEditPs(ps)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={() => deletePs(ps.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="bg-slate-900 border border-white/10 text-white sm:max-w-3xl font-lora max-h-[90vh] overflow-hidden flex flex-col">

                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl">Edit Team</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Update team details and member information.
                    </DialogDescription>
                </DialogHeader>
                {editingTeam && (
                    <form onSubmit={(e) => { e.preventDefault(); saveTeamUpdates(); }} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 p-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white">Team Name</Label>
                                <Input 
                                    value={editingTeam.name || ""} 
                                    onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Problem Statement</Label>
                                <Select 
                                    value={editingTeam.problemStatementId || "none"} 
                                    onValueChange={(val) => setEditingTeam({...editingTeam, problemStatementId: val === "none" ? undefined : val})}
                                >
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue placeholder="Select Problem" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white max-h-[200px]">
                                        <SelectItem value="none">None</SelectItem>
                                        {problemStatements.map(ps => (
                                            <SelectItem key={ps.id} value={ps.id}>
                                                [{ps.id}] {ps.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Open Innovation Fields */}
                            {problemStatements.find(ps => ps.id === editingTeam.problemStatementId)?.title.toLowerCase().includes("open innovation") && (
                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-white/10 rounded-lg bg-white/5">
                                    <div className="col-span-1 md:col-span-2">
                                        <h4 className="text-yellow-400 font-semibold mb-2">Open Innovation Details</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Custom Title</Label>
                                        <Input 
                                            value={editingTeam.customProblemTitle || ""} 
                                            onChange={(e) => setEditingTeam({...editingTeam, customProblemTitle: e.target.value})}
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-500"
                                            placeholder="Enter their problem title"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-1 md:col-span-2">
                                        <Label>Custom Description</Label>
                                        <Textarea 
                                            value={editingTeam.customProblemDescription || ""} 
                                            onChange={(e) => setEditingTeam({...editingTeam, customProblemDescription: e.target.value})}
                                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-500"
                                            placeholder="Enter their problem description"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-white">Leader Email</Label>
                                <Input 
                                    value={editingTeam.leaderEmail || ""} 
                                    onChange={(e) => setEditingTeam({...editingTeam, leaderEmail: e.target.value})}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Leader Phone</Label>
                                <Input 
                                    value={editingTeam.phone || ""} 
                                    onChange={(e) => setEditingTeam({...editingTeam, phone: e.target.value})}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>
                        </div>

                         <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <Label className="text-white text-lg font-semibold">Members</Label>
                                 <Button 
                                    type="button" 
                                    size="sm" 
                                    onClick={() => {
                                        const newMember = { name: "New Member", email: "", phone: "", gender: "Male", course: "B.Tech", year: "1" };
                                        setEditingTeam({...editingTeam, members: [...(editingTeam.members || []), newMember]});
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Member
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {editingTeam.members?.map((member, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-4 space-y-3 relative group border border-white/5 hover:border-white/20 transition-all">
                                        <div className="absolute top-3 right-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <Button 
                                                type="button" 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                onClick={() => {
                                                    const newMembers = [...(editingTeam.members || [])];
                                                    newMembers.splice(idx, 1);
                                                    setEditingTeam({...editingTeam, members: newMembers});
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Name</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? member : member.name || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') {
                                                            newMembers[idx] = { name: e.target.value } as any; 
                                                        } else {
                                                            newMembers[idx].name = e.target.value;
                                                        }
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Email</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : member.email || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        newMembers[idx].email = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Phone</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : member.phone || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        newMembers[idx].phone = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Gender</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : member.gender || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        newMembers[idx].gender = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Course</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : member.course || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        newMembers[idx].course = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Year</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : member.year || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        newMembers[idx].year = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/10">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>

        <Dialog open={editPsOpen} onOpenChange={setEditPsOpen}>
            <DialogContent className="bg-slate-900 border border-white/10 text-white sm:max-w-2xl font-lora">
                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl">Edit Problem Statement</DialogTitle>
                     <DialogDescription className="text-slate-400">
                        Update details for {editingPs?.id}
                    </DialogDescription>
                </DialogHeader>
                {editingPs && (
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Title</Label>
                            <Input 
                                value={editingPs.title} 
                                onChange={(e) => setEditingPs({...editingPs, title: e.target.value})} 
                                className="bg-black/20 border-white/10 text-white" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Domain</Label>
                            <Input 
                                value={editingPs.domain} 
                                onChange={(e) => setEditingPs({...editingPs, domain: e.target.value})} 
                                className="bg-black/20 border-white/10 text-white" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Category</Label>
                                <select 
                                    value={editingPs.category} 
                                    onChange={(e) => setEditingPs({...editingPs, category: e.target.value})} 
                                    className="w-full h-10 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                                >
                                    <option value="Software" className="bg-slate-900">Software</option>
                                    <option value="Hardware" className="bg-slate-900">Hardware</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400">Max Teams</Label>
                                <Input 
                                    type="number" 
                                    value={editingPs.maxLimit} 
                                    onChange={(e) => setEditingPs({...editingPs, maxLimit: Number(e.target.value)})} 
                                    className="bg-black/20 border-white/10 text-white" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-400">Description</Label>
                            <textarea
                                value={editingPs.description} 
                                onChange={(e) => setEditingPs({...editingPs, description: e.target.value})} 
                                className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditPsOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/10">
                                Cancel
                            </Button>
                            <Button onClick={updatePs} className="bg-purple-600 hover:bg-purple-700 text-white">
                                Save Updates
                            </Button>
                        </DialogFooter>
                     </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
