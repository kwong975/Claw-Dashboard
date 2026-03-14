import { useState } from "react";
import { StatusBadge, type StatusType } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  AlertCircle, Clock, Users, Ban, CheckCircle2, Search,
  ArrowUpDown, ChevronRight, X, FileText, Mail, MessageSquare,
  CalendarDays, User,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ── Types ─────────────────────────────────────────────── */

type IssueState = "active" | "waiting_on_me" | "waiting_on_other" | "blocked" | "resolved";
type IssueType = "compliance" | "budget" | "delivery" | "operations" | "hiring";
type Severity = "critical" | "high" | "medium" | "low";
type Move = "escalate" | "follow_up" | "decide" | "delegate" | "close";

interface Commitment {
  owner: string;
  title: string;
  status: "open" | "overdue" | "done";
  due: string;
}

interface Thread {
  title: string;
  lastActivity: string;
}

interface Artifact {
  type: "meeting_note" | "email" | "document";
  title: string;
  date: string;
}

interface Issue {
  id: string;
  title: string;
  state: IssueState;
  type: IssueType;
  severity: Severity;
  priority_score: number;
  recommended_move: Move;
  reasoning: string[];
  participants: string[];
  commitments: Commitment[];
  threads: Thread[];
  artifacts: Artifact[];
}

/* ── Mock Data ─────────────────────────────────────────── */

const issues: Issue[] = [
  {
    id: "iss-001", title: "Compliance Policies", state: "active", type: "compliance",
    severity: "critical", priority_score: 0.92, recommended_move: "escalate",
    reasoning: ["3 overdue commitments", "Regulatory deadline approaching", "Multiple stakeholders blocked"],
    participants: ["Raymond", "ChrisLiu", "Sarah"],
    commitments: [
      { owner: "Raymond", title: "Submit updated policy draft", status: "overdue", due: "Mar 10" },
      { owner: "ChrisLiu", title: "Review audit findings", status: "overdue", due: "Mar 08" },
      { owner: "Sarah", title: "Legal sign-off", status: "open", due: "Mar 18" },
      { owner: "Raymond", title: "Notify compliance board", status: "open", due: "Mar 20" },
    ],
    threads: [
      { title: "Re: Compliance deadline extension", lastActivity: "2h ago" },
      { title: "Audit findings Q1", lastActivity: "1d ago" },
    ],
    artifacts: [
      { type: "meeting_note", title: "Compliance standup Mar 12", date: "Mar 12" },
      { type: "email", title: "Regulatory update from legal", date: "Mar 11" },
    ],
  },
  {
    id: "iss-002", title: "Budget Review Q2", state: "waiting_on_me", type: "budget",
    severity: "high", priority_score: 0.80, recommended_move: "decide",
    reasoning: ["Approval pending your decision", "Finance team waiting", "Board meeting in 5 days"],
    participants: ["Raymond", "Finance Team"],
    commitments: [
      { owner: "You", title: "Approve budget allocation", status: "open", due: "Mar 16" },
      { owner: "Finance Team", title: "Prepare final numbers", status: "done", due: "Mar 12" },
    ],
    threads: [{ title: "Q2 Budget — final numbers", lastActivity: "4h ago" }],
    artifacts: [
      { type: "document", title: "Q2 Budget Spreadsheet", date: "Mar 12" },
      { type: "email", title: "Budget approval request", date: "Mar 11" },
    ],
  },
  {
    id: "iss-003", title: "Tencent Audit Preparation", state: "active", type: "compliance",
    severity: "high", priority_score: 0.78, recommended_move: "follow_up",
    reasoning: ["Audit date confirmed", "2 open items remaining", "Need sign-off from Raymond"],
    participants: ["Raymond", "AuditTeam", "External"],
    commitments: [
      { owner: "AuditTeam", title: "Complete document review", status: "open", due: "Mar 17" },
      { owner: "Raymond", title: "Sign audit readiness form", status: "open", due: "Mar 15" },
    ],
    threads: [{ title: "Tencent audit — prep checklist", lastActivity: "6h ago" }],
    artifacts: [{ type: "meeting_note", title: "Audit prep call Mar 11", date: "Mar 11" }],
  },
  {
    id: "iss-004", title: "Platform Migration Blocked", state: "blocked", type: "delivery",
    severity: "high", priority_score: 0.75, recommended_move: "escalate",
    reasoning: ["Dependency on infrastructure team", "No response in 3 days", "Downstream deliverables at risk"],
    participants: ["DevOps", "InfraTeam", "ProductLead"],
    commitments: [
      { owner: "InfraTeam", title: "Provision staging environment", status: "overdue", due: "Mar 09" },
      { owner: "DevOps", title: "Migration script ready", status: "done", due: "Mar 10" },
    ],
    threads: [{ title: "Re: Staging env request — urgent", lastActivity: "3d ago" }],
    artifacts: [{ type: "email", title: "Infrastructure request follow-up", date: "Mar 10" }],
  },
  {
    id: "iss-005", title: "Vendor Contract Renewal", state: "waiting_on_other", type: "operations",
    severity: "medium", priority_score: 0.62, recommended_move: "follow_up",
    reasoning: ["Waiting on vendor response", "Contract expires in 2 weeks"],
    participants: ["Procurement", "VendorContact"],
    commitments: [
      { owner: "VendorContact", title: "Send revised terms", status: "open", due: "Mar 14" },
      { owner: "Procurement", title: "Internal review", status: "open", due: "Mar 18" },
    ],
    threads: [{ title: "Contract renewal — Vendor X", lastActivity: "2d ago" }],
    artifacts: [{ type: "document", title: "Current contract terms", date: "Feb 28" }],
  },
  {
    id: "iss-006", title: "Engineering Hiring Pipeline", state: "active", type: "hiring",
    severity: "medium", priority_score: 0.55, recommended_move: "delegate",
    reasoning: ["5 open positions", "Interview backlog growing"],
    participants: ["HR", "EngineeringLead"],
    commitments: [
      { owner: "HR", title: "Schedule remaining interviews", status: "open", due: "Mar 19" },
      { owner: "EngineeringLead", title: "Review candidate shortlist", status: "open", due: "Mar 16" },
    ],
    threads: [{ title: "Hiring pipeline update", lastActivity: "1d ago" }],
    artifacts: [{ type: "meeting_note", title: "Hiring sync Mar 10", date: "Mar 10" }],
  },
  {
    id: "iss-007", title: "SOC 2 Report Delivered", state: "resolved", type: "compliance",
    severity: "low", priority_score: 0.15, recommended_move: "close",
    reasoning: ["Report delivered and accepted", "No open items"],
    participants: ["ComplianceTeam"],
    commitments: [
      { owner: "ComplianceTeam", title: "Deliver final report", status: "done", due: "Mar 08" },
    ],
    threads: [{ title: "SOC 2 — final delivery", lastActivity: "5d ago" }],
    artifacts: [{ type: "document", title: "SOC 2 Type II Report", date: "Mar 08" }],
  },
  {
    id: "iss-008", title: "Customer Escalation — Acme", state: "resolved", type: "operations",
    severity: "high", priority_score: 0.10, recommended_move: "close",
    reasoning: ["Issue resolved", "Customer confirmed"],
    participants: ["Support", "AccountManager"],
    commitments: [
      { owner: "Support", title: "Root cause analysis", status: "done", due: "Mar 07" },
      { owner: "AccountManager", title: "Customer follow-up", status: "done", due: "Mar 09" },
    ],
    threads: [{ title: "Acme escalation resolved", lastActivity: "4d ago" }],
    artifacts: [
      { type: "email", title: "Acme — resolution confirmation", date: "Mar 09" },
      { type: "meeting_note", title: "Post-mortem Mar 10", date: "Mar 10" },
    ],
  },
];

const meetingContext = [
  {
    participant: "Raymond",
    issues: [
      { title: "Compliance Policies", move: "escalate" as Move },
      { title: "Budget Review Q2", move: "decide" as Move },
      { title: "Tencent Audit Preparation", move: "follow_up" as Move },
    ],
  },
  {
    participant: "ChrisLiu",
    issues: [
      { title: "Compliance Policies", move: "escalate" as Move },
    ],
  },
  {
    participant: "ProductLead",
    issues: [
      { title: "Platform Migration Blocked", move: "escalate" as Move },
    ],
  },
];

/* ── Helpers ───────────────────────────────────────────── */

const stateColor: Record<IssueState, string> = {
  active: "text-info",
  waiting_on_me: "text-warning",
  waiting_on_other: "text-[hsl(48_85%_52%)]",
  blocked: "text-critical",
  resolved: "text-success",
};

const stateBg: Record<IssueState, string> = {
  active: "bg-info/10",
  waiting_on_me: "bg-warning/10",
  waiting_on_other: "bg-[hsl(48_85%_52%)/0.1]",
  blocked: "bg-critical/10",
  resolved: "bg-success/10",
};

const stateLabel: Record<IssueState, string> = {
  active: "Active",
  waiting_on_me: "Waiting on Me",
  waiting_on_other: "Waiting on Others",
  blocked: "Blocked",
  resolved: "Resolved",
};

const moveLabel: Record<Move, string> = {
  escalate: "Escalate",
  follow_up: "Follow Up",
  decide: "Decide",
  delegate: "Delegate",
  close: "Close",
};

const severityToStatus: Record<Severity, StatusType> = {
  critical: "critical",
  high: "warning",
  medium: "pending",
  low: "healthy",
};

const priorityIcon = (score: number) => {
  if (score >= 0.8) return "text-critical";
  if (score >= 0.6) return "text-warning";
  return "text-muted-foreground";
};

const artifactIcon = (type: Artifact["type"]) => {
  switch (type) {
    case "meeting_note": return FileText;
    case "email": return Mail;
    case "document": return FileText;
  }
};

type TileFilter = "attention" | "waiting_on_me" | "waiting_on_other" | "blocked" | "resolved" | null;

/* ── Component ─────────────────────────────────────────── */

export default function ResolutionBoard() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [personFilter, setPersonFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [tileFilter, setTileFilter] = useState<TileFilter>(null);

  // Computed counts
  const counts = {
    attention: issues.filter(i => i.state !== "resolved" && i.priority_score >= 0.6).length,
    waiting_on_me: issues.filter(i => i.state === "waiting_on_me").length,
    waiting_on_other: issues.filter(i => i.state === "waiting_on_other").length,
    blocked: issues.filter(i => i.state === "blocked").length,
    resolved: issues.filter(i => i.state === "resolved").length,
  };

  // All unique participants
  const allParticipants = [...new Set(issues.flatMap(i => i.participants))].sort();
  const allTypes = [...new Set(issues.map(i => i.type))].sort();

  // Filter & sort
  const filtered = issues
    .filter(i => {
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) &&
          !i.participants.some(p => p.toLowerCase().includes(search.toLowerCase()))) return false;
      if (stateFilter !== "all" && i.state !== stateFilter) return false;
      if (personFilter !== "all" && !i.participants.includes(personFilter)) return false;
      if (typeFilter !== "all" && i.type !== typeFilter) return false;

      // Tile filters
      if (tileFilter === "attention" && (i.state === "resolved" || i.priority_score < 0.6)) return false;
      if (tileFilter === "waiting_on_me" && i.state !== "waiting_on_me") return false;
      if (tileFilter === "waiting_on_other" && i.state !== "waiting_on_other") return false;
      if (tileFilter === "blocked" && i.state !== "blocked") return false;
      if (tileFilter === "resolved" && i.state !== "resolved") return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") return b.priority_score - a.priority_score;
      if (sortBy === "severity") {
        const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
      }
      return 0; // recent activity not tracked in mock
    });

  const openIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setDrawerOpen(true);
  };

  const filterByPerson = (person: string) => {
    setPersonFilter(person);
    setTileFilter(null);
  };

  const handleTileClick = (filter: TileFilter) => {
    setTileFilter(prev => prev === filter ? null : filter);
  };

  const overdueCount = (issue: Issue) => issue.commitments.filter(c => c.status === "overdue").length;
  const openCount = (issue: Issue) => issue.commitments.filter(c => c.status !== "done").length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Resolution Board</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Unresolved issues across meetings, emails, and commitments
        </p>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-5 gap-3">
        {([
          { key: "attention" as TileFilter, count: counts.attention, label: "Requires Attention", icon: AlertCircle, color: "text-critical" },
          { key: "waiting_on_me" as TileFilter, count: counts.waiting_on_me, label: "Waiting on Me", icon: Clock, color: "text-warning" },
          { key: "waiting_on_other" as TileFilter, count: counts.waiting_on_other, label: "Waiting on Others", icon: Users, color: "text-[hsl(48_85%_52%)]" },
          { key: "blocked" as TileFilter, count: counts.blocked, label: "Blocked / Stalled", icon: Ban, color: "text-critical" },
          { key: "resolved" as TileFilter, count: counts.resolved, label: "Resolved This Week", icon: CheckCircle2, color: "text-success" },
        ]).map(tile => (
          <button
            key={tile.key}
            onClick={() => handleTileClick(tile.key)}
            className={`rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent ${
              tileFilter === tile.key ? "ring-1 ring-primary border-primary" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <tile.icon className={`h-4 w-4 ${tile.color}`} />
              {tileFilter === tile.key && (
                <span className="text-[10px] font-medium text-primary uppercase tracking-wider">filtered</span>
              )}
            </div>
            <div className={`font-mono text-2xl font-semibold tabular-nums ${tile.color}`}>
              {tile.count}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{tile.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues or people..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 bg-card border-border"
          />
        </div>
        <Select value={stateFilter} onValueChange={v => { setStateFilter(v); setTileFilter(null); }}>
          <SelectTrigger className="w-[140px] h-9 bg-card border-border">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="waiting_on_me">Waiting on Me</SelectItem>
            <SelectItem value="waiting_on_other">Waiting on Others</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={personFilter} onValueChange={v => { setPersonFilter(v); }}>
          <SelectTrigger className="w-[140px] h-9 bg-card border-border">
            <SelectValue placeholder="Person" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All People</SelectItem>
            {allParticipants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); }}>
          <SelectTrigger className="w-[140px] h-9 bg-card border-border">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {allTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] h-9 bg-card border-border">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="severity">Severity</SelectItem>
            <SelectItem value="recent">Recent Activity</SelectItem>
          </SelectContent>
        </Select>
        {(tileFilter || stateFilter !== "all" || personFilter !== "all" || typeFilter !== "all" || search) && (
          <button
            onClick={() => { setTileFilter(null); setStateFilter("all"); setPersonFilter("all"); setTypeFilter("all"); setSearch(""); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Main Content: Queue + Meeting Context */}
      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Attention Queue */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-display text-sm font-semibold">Attention Queue</h2>
            <span className="font-mono text-xs text-muted-foreground">{filtered.length} issues</span>
          </div>
          {filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {filtered.map(issue => (
                <button
                  key={issue.id}
                  onClick={() => openIssue(issue)}
                  className="flex items-center gap-4 px-4 py-3.5 w-full text-left hover:bg-accent/50 transition-colors group"
                >
                  {/* Left: priority dot + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      issue.priority_score >= 0.8 ? "bg-critical" : issue.priority_score >= 0.6 ? "bg-warning" : "bg-muted-foreground"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{issue.title}</span>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${stateColor[issue.state]} ${stateBg[issue.state]}`}>
                          {stateLabel[issue.state]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {issue.participants.slice(0, 3).join(", ")}
                          {issue.participants.length > 3 && ` +${issue.participants.length - 3}`}
                        </span>
                        <span>Open: {openCount(issue)}</span>
                        {overdueCount(issue) > 0 && (
                          <span className="text-critical">Overdue: {overdueCount(issue)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: score + move */}
                  <div className="text-right shrink-0">
                    <div className={`font-mono text-sm font-semibold tabular-nums ${priorityIcon(issue.priority_score)}`}>
                      {issue.priority_score.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      {moveLabel[issue.recommended_move]}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mb-3" />
              <p className="text-sm font-medium text-foreground">All clear</p>
              <p className="text-xs text-muted-foreground mt-1">No issues match the current filters</p>
            </div>
          )}
        </div>

        {/* Meeting Context Panel */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Meeting Context</h2>
          </div>
          <div className="p-3 space-y-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">
              Today's attendees
            </p>
            {meetingContext.map(ctx => (
              <div key={ctx.participant} className="space-y-1.5">
                <button
                  onClick={() => filterByPerson(ctx.participant)}
                  className="flex items-center gap-2 px-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {ctx.participant}
                </button>
                <div className="space-y-1 pl-6">
                  {ctx.issues.map(iss => (
                    <div key={iss.title} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate">{iss.title}</span>
                      <span className={`shrink-0 ml-2 font-medium ${
                        iss.move === "escalate" ? "text-critical" :
                        iss.move === "decide" ? "text-warning" :
                        "text-info"
                      }`}>
                        {moveLabel[iss.move].toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto bg-card border-border">
          {selectedIssue && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="font-display text-lg">{selectedIssue.title}</SheetTitle>
                <SheetDescription className="sr-only">Issue detail view</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Overview */}
                <section className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase">State</span>
                      <div className={`text-sm font-medium ${stateColor[selectedIssue.state]}`}>
                        {stateLabel[selectedIssue.state]}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase">Type</span>
                      <div className="text-sm font-medium text-foreground capitalize">{selectedIssue.type}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase">Severity</span>
                      <StatusBadge status={severityToStatus[selectedIssue.severity]} label={selectedIssue.severity} size="sm" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase">Priority</span>
                      <div className={`font-mono text-sm font-semibold ${priorityIcon(selectedIssue.priority_score)}`}>
                        {selectedIssue.priority_score.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase">Recommended Move</span>
                      <div className="text-sm font-medium text-primary">{moveLabel[selectedIssue.recommended_move]}</div>
                    </div>
                  </div>
                  {/* Reasoning */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Reasoning</span>
                    <ul className="space-y-1">
                      {selectedIssue.reasoning.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Participants */}
                <section className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Participants</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIssue.participants.map(p => (
                      <button
                        key={p}
                        onClick={() => { filterByPerson(p); setDrawerOpen(false); }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground hover:bg-accent/80 transition-colors"
                      >
                        <User className="h-3 w-3" /> {p}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Commitments */}
                <section className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Commitments</h3>
                  <div className="rounded-md border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-accent/30">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Owner</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Title</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedIssue.commitments.map((c, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-foreground font-medium">{c.owner}</td>
                            <td className="px-3 py-2 text-muted-foreground">{c.title}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                c.status === "overdue" ? "text-critical bg-critical/10" :
                                c.status === "done" ? "text-success bg-success/10" :
                                "text-info bg-info/10"
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right text-muted-foreground">{c.due}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Threads */}
                <section className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Supporting Threads</h3>
                  <div className="space-y-1.5">
                    {selectedIssue.threads.map((t, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md bg-accent/30 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-foreground">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          {t.title}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{t.lastActivity}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Artifacts */}
                <section className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Artifacts</h3>
                  <div className="space-y-1.5">
                    {selectedIssue.artifacts.map((a, i) => {
                      const AIcon = artifactIcon(a.type);
                      return (
                        <div key={i} className="flex items-center justify-between rounded-md bg-accent/30 px-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-foreground">
                            <AIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {a.title}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{a.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
