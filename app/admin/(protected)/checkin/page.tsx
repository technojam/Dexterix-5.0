"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { StarsBackground } from "@/components/ui/stars-bg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Search, CheckCircle2, Circle, User, LogOut, LayoutDashboard, Armchair, Edit, Plus, Trash2 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";

interface Team {
  id: string;
  name: string;
  leaderName?: string;
  leaderEmail?: string;
  phone?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members?: (string | { name: string; [key: string]: any })[];
  college?: string;
//   year?: string;
  checkedIn?: boolean;
  tableNumber?: string | number;
  problemStatementId?: string;
  customProblemTitle?: string;
  customProblemDescription?: string;
}

interface ProblemStatement {
    id: string;
    title: string;
    category: string;
}


export default function CheckInPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalTables, setTotalTables] = useState(100);
  const [canEditTeams, setCanEditTeams] = useState(false);
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  
  // Dialog State
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Edit State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
    fetchSettings();
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
        const res = await fetch("/api/admin/problems");
        if (res.ok) {
            const data = await res.json();
            setProblemStatements(data);
        }
    } catch {
        console.error("Failed to load problems");
    }
  };

  const fetchSettings = async () => {
      try {
          const res = await fetch("/api/settings");
          const data = await res.json();
          if (data.totalTables) setTotalTables(data.totalTables);
          if (data.volunteersCanEditTeams !== undefined) setCanEditTeams(data.volunteersCanEditTeams);
      } catch {
          console.error("Failed to load settings");
      }
  };

  const fetchTeams = async () => {
      setLoading(true);
      try {
          // Re-use admin teams endpoint (assuming session allows it)
          const res = await fetch("/api/admin/teams");
          const data = await res.json();
          if (res.ok) {
              setTeams(data.teams || []);
              if (data.role) setRole(data.role);
          } else {
              if (res.status === 401 || res.status === 403) {
                  window.location.href = "/admin/login";
              }
              toast.error("Failed to load teams");
          }
      } catch {
          toast.error("Network error");
      } finally {
          setLoading(false);
      }
  };

  const handleCheckInClick = (team: Team) => {
      if (team.checkedIn) {
          // If already checked in, we are cancelling/undoing
          if (confirm(`Mark ${team.name} as NOT Arrived? This will free up Table ${team.tableNumber}.`)) {
              performCheckIn(team, false, null);
          }
      } else {
          // Open Dialog to select table
          setSelectedTeam(team);
          setSelectedTable(getNextAvailableTable());
          setIsDialogOpen(true);
      }
  };

  const getOccupiedTables = () => {
      const occupied = new Set<number>();
      teams.forEach(t => {
          if (t.checkedIn && t.tableNumber) occupied.add(Number(t.tableNumber));
      });
      return occupied;
  };

  const getNextAvailableTable = () => {
      const occupied = getOccupiedTables();
      for (let i = 1; i <= totalTables; i++) {
          if (!occupied.has(i)) return i;
      }
      return null;
  };

  const confirmTableSelection = () => {
      if (selectedTeam && selectedTable) {
          performCheckIn(selectedTeam, true, selectedTable);
          setIsDialogOpen(false);
          setSelectedTeam(null);
          setSelectedTable(null);
      } else {
          toast.error("Please select a table");
      }
  };

  const performCheckIn = async (team: Team, status: boolean, tableNumber: number | null) => {
      setProcessing(team.id);
      
      try {
          const res = await fetch("/api/admin/checkin", {
              method: "PATCH",
              body: JSON.stringify({ teamId: team.id, status, tableNumber }),
              headers: { "Content-Type": "application/json" }
          });
          
          if (res.ok) {
              await res.json(); // Get returned team to ensure sync
              
              setTeams(prev => prev.map(t => {
                   if (t.id === team.id) {
                       return { 
                           ...t, 
                           checkedIn: status, 
                           tableNumber: tableNumber ? tableNumber.toString() : undefined 
                       };
                   }
                   return t;
              }));
              
              toast.success(status ? `Checked In: ${team.name} at Table ${tableNumber}` : `Reverted: ${team.name}`);
          } else {
              toast.error("Update failed");
          }
      } catch {
          toast.error("Error updating status");
      } finally {
          setProcessing(null);
      }
  };

  const saveTeamUpdates = async () => {
      if (!editingTeam) return;
      try {
          const res = await fetch("/api/admin/teams", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(editingTeam)
          });
          
          if (res.ok) {
              toast.success("Team Updated");
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
    } catch {
        toast.error("Logout failed");
    }
  };

  const filteredTeams = teams.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.leaderEmail && t.leaderEmail.toLowerCase().includes(search.toLowerCase())) ||
      (t.members && t.members.some((m) => {
          const name = typeof m === 'string' ? m : m.name;
          return name.toLowerCase().includes(search.toLowerCase());
      }))
  );

  return (
    <div className="relative min-h-screen w-full bg-[#000512] text-white font-lora">
         {/* Removing StarsBackground due to performance issues on large lists */}
         
         <div className="relative z-10 container mx-auto pt-32 pb-12 px-4 max-w-4xl">
             <div className="flex justify-between items-center mb-8">
                 <div>
                    <h1 className="text-3xl font-bold text-white">Event Check-in</h1>
                    <p className="text-slate-400 text-sm">Volunteer Panel</p>
                 </div>
                 <div className="flex gap-2">
                     {role === "admin" && (
                         <Button 
                            variant="outline" 
                            onClick={() => window.location.href = "/admin"}
                            className="bg-purple-600/20 border-purple-500/30 text-purple-200 hover:bg-purple-600/30 hover:text-white"
                         >
                             <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                         </Button>
                     )}
                     <Button 
                        variant="outline" 
                        onClick={logout} 
                        className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                     >
                         <LogOut className="h-4 w-4 mr-2" /> Logout
                     </Button>
                 </div>
             </div>

             <div className="mb-6 relative">
                 <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                 <Input 
                    className="pl-10 bg-white/5 border-white/10 text-white h-12 text-lg" 
                    placeholder="Search by Team Name, ID or Email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 />
             </div>
             
             {loading ? (
                 <div className="flex justify-center p-12">
                     <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                 </div>
             ) : (
                <div className="space-y-4">
                    {filteredTeams.map((team) => (
                        <Card key={team.id} className={`bg-white/5 border transition-all ${team.checkedIn ? 'border-green-500/50 bg-green-900/10' : 'border-white/10'}`}>
                            {/* Simplified Card Content for performance */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs px-2 py-1 rounded bg-white/10 text-slate-300">{team.id.substring(0,8)}</span>
                                            <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                                        </div>
                                        
                                        <div className="space-y-2 mt-2 pl-2 border-l-2 border-white/10">
                                            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Roster</h4>
                                            
                                            <div className="flex items-center gap-2 text-sm text-yellow-100/90">
                                                <User className="h-4 w-4" /> 
                                                <span className="font-semibold">{team.leaderName || "Leader"}</span>
                                                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 rounded">LEADER</span>
                                            </div>
                                            
                                            {team.members && team.members.length > 0 ? (
                                                team.members
                                                    .filter(member => {
                                                        const name = typeof member === 'string' ? member : member.name;
                                                        // Filter out leader if they appear in members list
                                                        return name.toLowerCase().trim() !== (team.leaderName || "").toLowerCase().trim();
                                                    })
                                                    .map((member, idx) => {
                                                        const name = typeof member === 'string' ? member : member.name;
                                                        return (
                                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                                                <User className="h-3 w-3 opacity-50" /> 
                                                                <span>{name}</span>
                                                            </div>
                                                        );
                                                })
                                            ) : (
                                                <p className="text-xs text-slate-500 italic">No additional members listed</p>
                                            )}
                                        </div>
                                        
                                        <div className="text-xs text-slate-400 pt-2">
                                            {team.college && <span className="block">{team.college}</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center md:items-end gap-3">
                                        {(canEditTeams || role === "admin") && (
                                            <Button
                                                variant="ghost" 
                                                size="sm"
                                                className="text-slate-400 hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTeam({...team});
                                                    setEditDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-2" /> Edit Details
                                            </Button>
                                        )}

                                        {team.checkedIn && team.tableNumber && (
                                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                                                <Armchair className="h-5 w-5 text-blue-400" />
                                                <div className="text-center">
                                                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Table</span>
                                                    <span className="font-mono text-xl font-bold text-blue-200">#{team.tableNumber}</span>
                                                </div>
                                            </div>
                                        )}
                                    
                                        <Button
                                            onClick={() => handleCheckInClick(team)}
                                            disabled={processing === team.id}
                                            size="lg"
                                            className={`w-full md:w-auto min-w-[160px] h-14 text-base font-bold transition-all ${
                                                team.checkedIn 
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-red-600 hover:to-red-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] group' 
                                                : 'bg-white/10 hover:bg-white/20 text-slate-300'
                                            }`}
                                        >
                                            {processing === team.id ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : team.checkedIn ? (
                                                <div className="flex items-center">
                                                    <span className="group-hover:hidden flex items-center"><CheckCircle2 className="h-5 w-5 mr-2" /> Checked In</span>
                                                    <span className="hidden group-hover:flex items-center"><LogOut className="h-5 w-5 mr-2" /> Undo Check-in</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Circle className="h-5 w-5 mr-2" />
                                                    Check In
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {filteredTeams.length === 0 && (
                        <div className="text-center text-slate-500 py-12">
                            No teams matching your search.
                        </div>
                    )}
                </div>
             )}
         </div>

         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-3xl max-h-[80vh] flex flex-col">
                 <DialogHeader>
                     <DialogTitle className="text-xl">Assign Table - {selectedTeam?.name}</DialogTitle>
                     <DialogDescription className="text-slate-400">
                         Select a table for this team. Only available tables are shown.
                     </DialogDescription>
                 </DialogHeader>
                 
                 <div className="flex-1 overflow-y-auto p-4 border border-white/5 rounded-lg bg-black/20 my-4 min-h-[300px]">
                     <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                         {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => {
                             const isOccupied = getOccupiedTables().has(num);
                             if (isOccupied) return null; // "Disappear from list"
                             
                             return (
                                 <button
                                    key={num}
                                    onClick={() => setSelectedTable(num)}
                                    className={`
                                        h-10 rounded border text-sm font-bold transition-all
                                        ${selectedTable === num 
                                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] scale-110' 
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                                    `}
                                 >
                                     {num}
                                 </button>
                             );
                         })}
                     </div>
                 </div>

                 <DialogFooter className="gap-2">
                     <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                     <Button 
                        onClick={confirmTableSelection} 
                        disabled={!selectedTable}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                     >
                         Confirm & Check In
                     </Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="bg-[#0f172a] border-white/10 text-white font-lora w-full sm:max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Team Details</DialogTitle>
                    <DialogDescription className="text-slate-400">Modify team information and members.</DialogDescription>
                </DialogHeader>
                {editingTeam && (
                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 p-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Team Name</Label>
                                <Input 
                                    value={editingTeam.name} 
                                    onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                                    className="bg-white/5 border-white/10 placeholder:text-slate-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Leader Name</Label>
                                <Input 
                                    value={editingTeam.leaderName || ""} 
                                    onChange={(e) => setEditingTeam({...editingTeam, leaderName: e.target.value})}
                                    className="bg-white/5 border-white/10 placeholder:text-slate-500"
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>Leader Email</Label>
                                <Input 
                                    value={editingTeam.leaderEmail || ""} 
                                    onChange={(e) => setEditingTeam({...editingTeam, leaderEmail: e.target.value})}
                                    className="bg-white/5 border-white/10 placeholder:text-slate-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Leader Phone</Label>
                                <Input 
                                    value={editingTeam.phone || ""} 
                                    onChange={(e) => setEditingTeam({...editingTeam, phone: e.target.value})}
                                    className="bg-white/5 border-white/10 placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* Members Section */}
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
                                                    value={typeof member === 'string' ? "" : (member as any).email || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        (newMembers[idx] as any).email = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Phone</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : (member as any).phone || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        (newMembers[idx] as any).phone = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Gender</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : (member as any).gender || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        (newMembers[idx] as any).gender = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Course</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : (member as any).course || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        (newMembers[idx] as any).course = e.target.value;
                                                        setEditingTeam({...editingTeam, members: newMembers});
                                                    }}
                                                    className="bg-black/20 border-white/10 text-white h-9 text-sm"
                                                />
                                            </div>
                                             <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Year</Label>
                                                 <Input 
                                                    value={typeof member === 'string' ? "" : (member as any).year || ""} 
                                                    onChange={(e) => {
                                                        const newMembers = [...(editingTeam.members || [])];
                                                        if (typeof newMembers[idx] === 'string') newMembers[idx] = { name: newMembers[idx] } as any;
                                                        (newMembers[idx] as any).year = e.target.value;
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
                    </div>
                )}
                <DialogFooter className="pt-2">
                    <Button variant="ghost" onClick={() => setEditDialogOpen(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                    <Button onClick={saveTeamUpdates} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
