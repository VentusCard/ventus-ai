import { Users, UserPlus, MoreVertical, Mail, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Role = "Owner" | "Admin" | "Analyst" | "Viewer";

const members: { name: string; email: string; role: Role; lastActive: string; color: string }[] = [
  { name: "Margaret Chen", email: "m.chen@ourbank.com", role: "Owner", lastActive: "Active now", color: "bg-blue-500" },
  { name: "David Okonkwo", email: "d.okonkwo@ourbank.com", role: "Admin", lastActive: "2 hours ago", color: "bg-purple-500" },
  { name: "Sarah Patel", email: "s.patel@ourbank.com", role: "Admin", lastActive: "Yesterday", color: "bg-emerald-500" },
  { name: "James Whitfield", email: "j.whitfield@ourbank.com", role: "Analyst", lastActive: "3 hours ago", color: "bg-amber-500" },
  { name: "Linda Foster", email: "l.foster@ourbank.com", role: "Analyst", lastActive: "Yesterday", color: "bg-rose-500" },
  { name: "Carlos Rivera", email: "c.rivera@ourbank.com", role: "Analyst", lastActive: "2 days ago", color: "bg-indigo-500" },
  { name: "Priya Iyer", email: "p.iyer@ourbank.com", role: "Viewer", lastActive: "5 days ago", color: "bg-teal-500" },
  { name: "Thomas Müller", email: "t.muller@ourbank.com", role: "Viewer", lastActive: "1 week ago", color: "bg-slate-500" },
];

const pending = [
  { email: "newhire@ourbank.com", role: "Analyst" as Role, invitedBy: "Sarah Patel", sent: "2 days ago" },
  { email: "advisor@ourbank.com", role: "Viewer" as Role, invitedBy: "David Okonkwo", sent: "Yesterday" },
];

const permissions = [
  "View analytics",
  "Manage deals",
  "Configure campaigns",
  "Edit settings",
  "Manage billing",
  "Invite & remove users",
];

const roleMatrix: Record<Role, boolean[]> = {
  Owner: [true, true, true, true, true, true],
  Admin: [true, true, true, true, false, true],
  Analyst: [true, true, true, false, false, false],
  Viewer: [true, false, false, false, false, false],
};

const roleColors: Record<Role, string> = {
  Owner: "bg-blue-50 text-blue-700 border-blue-200",
  Admin: "bg-purple-50 text-purple-700 border-purple-200",
  Analyst: "bg-amber-50 text-amber-700 border-amber-200",
  Viewer: "bg-slate-100 text-slate-700 border-slate-200",
};

function initials(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("");
}

export function TeamView() {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Users className="w-4 h-4" />}
        title="Team & Permissions"
        subtitle="Manage who has access to Ventus and what they can do"
        howItWorks="Roles bundle permissions across analytics, deals, settings, and billing. Owners can promote, demote, and remove any user."
        whyItMatters="Tight role hygiene keeps customer data scoped to the people who need it and audit trails clean for compliance."
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900">{members.length} <span className="text-sm font-normal text-slate-500">team members</span></p>
          <p className="text-xs text-slate-500 mt-0.5">{pending.length} pending invitations</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold`}>
                      {initials(m.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${roleColors[m.role]} border text-[11px] hover:opacity-100`} variant="outline">{m.role}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600">{m.lastActive}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change role</DropdownMenuItem>
                      <DropdownMenuItem>Resend welcome email</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove from team</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {pending.length > 0 && (
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
            <Mail className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Pending Invitations</h3>
          </div>
          <div className="space-y-2">
            {pending.map((p) => (
              <div key={p.email} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.email}</p>
                  <p className="text-xs text-slate-500 truncate">Invited by {p.invitedBy} · {p.sent}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`${roleColors[p.role]} border text-[11px]`} variant="outline">{p.role}</Badge>
                  <Button variant="ghost" size="sm" className="text-xs">Resend</Button>
                  <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive">Revoke</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Users className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Role Permissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 py-2 pr-4">Permission</th>
                {(Object.keys(roleMatrix) as Role[]).map((r) => (
                  <th key={r} className="text-center text-xs font-semibold text-slate-500 py-2 px-3">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr key={perm} className="border-b border-slate-50 last:border-0">
                  <td className="text-sm text-slate-700 py-2.5 pr-4">{perm}</td>
                  {(Object.keys(roleMatrix) as Role[]).map((r) => (
                    <td key={r} className="text-center py-2.5 px-3">
                      {roleMatrix[r][idx] ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
