import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { joinGroup } from "@/lib/constituents.functions";
import { myMembership } from "@/lib/groups.functions";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";

export function JoinTondoButton({ groupId, memberCount }: { groupId: string; memberCount: number }) {
  const { user } = useAuth();
  const membershipFn = useServerFn(myMembership);
  const joinFn = useServerFn(joinGroup);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["membership", groupId],
    queryFn: () => membershipFn({ data: { group_id: groupId } }),
    enabled: !!user,
  });

  const mutate = useMutation({
    mutationFn: (leave: boolean) => joinFn({ data: { group_id: groupId, leave } }),
    onSuccess: (r) => {
      toast.success(r.joined ? "You joined this TONDO" : "You left this TONDO");
      qc.invalidateQueries({ queryKey: ["membership", groupId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (!user) {
    return (
      <Link to="/auth" search={{ mode: "signin" }} className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-white/10 text-sm hover:bg-white/5">
        <UserPlus className="h-4 w-4 text-emerald" /> Sign in to join · {memberCount} members
      </Link>
    );
  }

  const joined = data?.joined;
  return (
    <button
      onClick={() => mutate.mutate(!!joined)}
      disabled={mutate.isPending}
      className={`h-10 px-4 inline-flex items-center gap-2 rounded-lg text-sm font-medium disabled:opacity-60 ${
        joined ? "border border-emerald/40 text-emerald bg-emerald/10" : "bg-aurora text-white glow-electric"
      }`}
    >
      {joined ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {joined ? "Member" : "Join TONDO"} · {memberCount}
    </button>
  );
}
