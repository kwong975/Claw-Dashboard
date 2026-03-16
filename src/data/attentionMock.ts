import type { Matter } from "@/lib/attention-types";

export const mockMatters: Matter[] = [
  {
    id: "m-001",
    title: "Compliance Policy Overhaul",
    participants: ["Raymond", "Chris Liu", "Sarah", "Legal Team"],
    momentum: "active",
    hasMeetingToday: true,
    lastActivityRelative: "2h ago",
    nextInteraction: { title: "SMT Breakfast", time: "today at 08:30" },
    interactions: [
      { title: "SMT Breakfast", type: "meeting", date: "Mar 16", relative: "today" },
      { title: "Compliance Standup", type: "meeting", date: "Mar 14", relative: "2 days ago" },
      { title: "Re: Audit timeline update", type: "email", date: "Mar 13", relative: "3 days ago" },
    ],
    commitments: [
      { owner: "Raymond", title: "Submit updated policy draft", status: "overdue", due: "Mar 10", origin: { label: "Compliance Standup", type: "meeting" } },
      { owner: "Chris Liu", title: "Review audit findings", status: "overdue", due: "Mar 08", origin: { label: "Audit Prep Call", type: "meeting" } },
      { owner: "Sarah", title: "Legal sign-off", status: "open", due: "Mar 18", origin: { label: "Audit timeline update", type: "email" } },
      { owner: "Raymond", title: "Notify compliance board", status: "open", due: "Mar 20", origin: { label: "SMT Breakfast", type: "meeting" } },
    ],
    signals: [
      { description: "Regulatory deadline moved up by 1 week", source: "Email from legal", timestamp: "2h ago" },
      { description: "Chris Liu flagged resource gap", source: "SMT Breakfast", timestamp: "today" },
    ],
  },
  {
    id: "m-002",
    title: "Q2 Budget Allocation",
    participants: ["Raymond", "Finance Team"],
    momentum: "active",
    hasMeetingToday: true,
    lastActivityRelative: "4h ago",
    nextInteraction: { title: "Board Prep Session", time: "today at 14:00" },
    interactions: [
      { title: "Board Prep Session", type: "meeting", date: "Mar 16", relative: "today" },
      { title: "Q2 Budget — final numbers", type: "email", date: "Mar 14", relative: "2 days ago" },
    ],
    commitments: [
      { owner: "You", title: "Approve budget allocation", status: "open", due: "Mar 16", origin: { label: "Board Prep Session", type: "meeting" } },
      { owner: "Finance Team", title: "Prepare final numbers", status: "done", due: "Mar 12", origin: { label: "Q2 Budget — final numbers", type: "email" } },
    ],
    signals: [
      { description: "Board meeting in 5 days — approval needed", source: "System", timestamp: "4h ago" },
    ],
  },
  {
    id: "m-003",
    title: "Tencent Audit Preparation",
    participants: ["Raymond", "Audit Team", "External Auditors"],
    momentum: "active",
    hasMeetingToday: false,
    lastActivityRelative: "6h ago",
    interactions: [
      { title: "Audit Prep Call", type: "meeting", date: "Mar 14", relative: "2 days ago" },
      { title: "Re: Document checklist", type: "email", date: "Mar 13", relative: "3 days ago" },
    ],
    commitments: [
      { owner: "Audit Team", title: "Complete document review", status: "open", due: "Mar 17", origin: { label: "Audit Prep Call", type: "meeting" } },
      { owner: "Raymond", title: "Sign audit readiness form", status: "open", due: "Mar 15", origin: { label: "Document checklist", type: "email" } },
    ],
    signals: [
      { description: "Audit date confirmed for Mar 22", source: "External Auditors", timestamp: "3d ago" },
    ],
  },
  {
    id: "m-004",
    title: "Platform Migration",
    participants: ["DevOps", "Infra Team", "Product Lead"],
    momentum: "blocked",
    hasMeetingToday: false,
    lastActivityRelative: "3d ago",
    interactions: [
      { title: "Re: Staging env request — urgent", type: "email", date: "Mar 13", relative: "3 days ago" },
    ],
    commitments: [
      { owner: "Infra Team", title: "Provision staging environment", status: "overdue", due: "Mar 09", origin: { label: "Staging env request", type: "email" } },
      { owner: "DevOps", title: "Migration script ready", status: "done", due: "Mar 10", origin: { label: "Migration kickoff", type: "meeting" } },
    ],
    signals: [
      { description: "No response from Infra Team in 3 days", source: "System", timestamp: "3d ago" },
    ],
  },
  {
    id: "m-005",
    title: "Vendor Contract Renewal",
    participants: ["Procurement", "Vendor Contact"],
    momentum: "drifting",
    hasMeetingToday: false,
    lastActivityRelative: "5d ago",
    interactions: [
      { title: "Contract renewal — Vendor X", type: "email", date: "Mar 11", relative: "5 days ago" },
    ],
    commitments: [
      { owner: "Vendor Contact", title: "Send revised terms", status: "overdue", due: "Mar 14", origin: { label: "Contract renewal — Vendor X", type: "email" } },
      { owner: "Procurement", title: "Internal review", status: "open", due: "Mar 18", origin: { label: "Contract renewal — Vendor X", type: "email" } },
    ],
    signals: [
      { description: "Contract expires in 2 weeks", source: "System", timestamp: "2d ago" },
    ],
  },
  {
    id: "m-006",
    title: "Engineering Hiring Pipeline",
    participants: ["HR", "Engineering Lead"],
    momentum: "quiet",
    hasMeetingToday: false,
    lastActivityRelative: "4d ago",
    interactions: [
      { title: "Hiring sync", type: "meeting", date: "Mar 12", relative: "4 days ago" },
    ],
    commitments: [
      { owner: "HR", title: "Schedule remaining interviews", status: "open", due: "Mar 19", origin: { label: "Hiring sync", type: "meeting" } },
      { owner: "Engineering Lead", title: "Review candidate shortlist", status: "open", due: "Mar 16", origin: { label: "Hiring sync", type: "meeting" } },
    ],
    signals: [],
  },
  {
    id: "m-007",
    title: "Customer Success Playbook",
    participants: ["CS Team", "Product Lead"],
    momentum: "quiet",
    hasMeetingToday: false,
    lastActivityRelative: "6d ago",
    interactions: [
      { title: "Playbook review session", type: "meeting", date: "Mar 10", relative: "6 days ago" },
    ],
    commitments: [
      { owner: "CS Team", title: "Draft playbook v2", status: "open", due: "Mar 20", origin: { label: "Playbook review session", type: "meeting" } },
    ],
    signals: [],
  },
];
