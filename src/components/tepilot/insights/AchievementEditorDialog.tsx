import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Gift, CreditCard, Star } from "lucide-react";
import type { ManagedAchievement, RewardConfig } from "@/types/bankwide";

const ICON_OPTIONS = [
  "Trophy", "Target", "TrendingUp", "Heart", "Plane", "ShoppingBag",
  "Utensils", "Home", "Dumbbell", "Smartphone", "PawPrint", "Users",
];

const CATEGORY_OPTIONS = [
  "Spending Diversity", "Wellness", "Travel", "Dining", "Home", "Savings",
  "Engagement", "Community",
];

const MERCHANT_OPTIONS = [
  "Starbucks", "Amazon", "Target", "Visa Gift Card", "Uber", "DoorDash",
  "Nike", "Apple",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: ManagedAchievement | null;
  onSave: (achievement: ManagedAchievement) => void;
}

export function AchievementEditorDialog({ open, onOpenChange, achievement, onSave }: Props) {
  const isNew = !achievement;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Trophy");
  const [category, setCategory] = useState("Spending Diversity");
  const [targetValue, setTargetValue] = useState(5);
  const [triggerLogic, setTriggerLogic] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reward config
  const [rewardEnabled, setRewardEnabled] = useState(false);
  const [rewardType, setRewardType] = useState<RewardConfig["type"]>("points");
  const [rewardValue, setRewardValue] = useState(500);
  const [merchantName, setMerchantName] = useState("Starbucks");
  const [fulfillment, setFulfillment] = useState<RewardConfig["fulfillment"]>("automatic");
  const [budgetCap, setBudgetCap] = useState(50000);

  useEffect(() => {
    if (achievement) {
      setTitle(achievement.title);
      setDescription(achievement.description);
      setIcon(achievement.icon);
      setCategory(achievement.category);
      setTargetValue(achievement.targetValue);
      setTriggerLogic(achievement.triggerLogic);
      setIsActive(achievement.isActive);
      if (achievement.reward) {
        setRewardEnabled(true);
        setRewardType(achievement.reward.type);
        setRewardValue(achievement.reward.value);
        setMerchantName(achievement.reward.merchantName || "Starbucks");
        setFulfillment(achievement.reward.fulfillment);
        setBudgetCap(achievement.reward.monthlyBudgetCap || 50000);
      } else {
        setRewardEnabled(false);
      }
    } else {
      setTitle("");
      setDescription("");
      setIcon("Trophy");
      setCategory("Spending Diversity");
      setTargetValue(5);
      setTriggerLogic("");
      setIsActive(true);
      setRewardEnabled(false);
      setRewardType("points");
      setRewardValue(500);
    }
  }, [achievement, open]);

  const handleSave = () => {
    const reward: RewardConfig | undefined = rewardEnabled
      ? {
          type: rewardType,
          value: rewardValue,
          merchantName: rewardType === "gift_card" ? merchantName : undefined,
          fulfillment,
          monthlyBudgetCap: budgetCap,
        }
      : undefined;

    onSave({
      id: achievement?.id || `custom-${Date.now()}`,
      title,
      description,
      icon,
      category,
      targetValue,
      triggerLogic,
      isActive,
      completionRate: achievement?.completionRate || 0,
      inProgressRate: achievement?.inProgressRate || 0,
      reward,
    });
    onOpenChange(false);
  };

  const rewardTypeIcons: Record<string, React.ReactNode> = {
    points: <Star className="h-4 w-4" />,
    gift_card: <Gift className="h-4 w-4" />,
    cashback: <DollarSign className="h-4 w-4" />,
    custom: <CreditCard className="h-4 w-4" />,
  };

  const estimatedMonthlyCost = rewardEnabled
    ? Math.round((achievement?.completionRate || 5) / 100 * 28_400_000 * rewardValue * (rewardType === "points" ? 0.01 : 1) / 12)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Create Achievement" : "Edit Achievement"}</DialogTitle>
          <DialogDescription>
            {isNew ? "Define a new achievement for your gamification program." : "Modify achievement settings and reward configuration."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diversified Spender" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what the user needs to do..." rows={2} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Value</Label>
              <Input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Label>Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trigger Logic</Label>
            <Input value={triggerLogic} onChange={(e) => setTriggerLogic(e.target.value)} placeholder="e.g. Spend in 5+ lifestyle pillars within 90 days" />
          </div>

          {/* Reward Configuration */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">Reward Automation</h4>
                <p className="text-xs text-slate-500">Configure automatic reward fulfillment on completion</p>
              </div>
              <Switch checked={rewardEnabled} onCheckedChange={setRewardEnabled} />
            </div>

            {rewardEnabled && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {/* Reward Type */}
                <div className="space-y-2">
                  <Label>Reward Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["points", "gift_card", "cashback", "custom"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setRewardType(t)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          rewardType === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {rewardTypeIcons[t]}
                        {t === "gift_card" ? "Gift Card" : t === "cashback" ? "Cashback" : t === "points" ? "Points" : "Custom"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reward Value</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={rewardValue}
                        onChange={(e) => setRewardValue(Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        {rewardType === "points" ? "pts" : rewardType === "cashback" ? "%" : "$"}
                      </span>
                    </div>
                  </div>

                  {rewardType === "gift_card" && (
                    <div className="space-y-2">
                      <Label>Merchant</Label>
                      <Select value={merchantName} onValueChange={setMerchantName}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MERCHANT_OPTIONS.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fulfillment Mode</Label>
                    <Select value={fulfillment} onValueChange={(v) => setFulfillment(v as RewardConfig["fulfillment"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual_approval">Manual Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Budget Cap</Label>
                    <div className="relative">
                      <Input type="number" value={budgetCap} onChange={(e) => setBudgetCap(Number(e.target.value))} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$/mo</span>
                    </div>
                  </div>
                </div>

                {/* Cost Estimate */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Estimated Monthly Cost</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${estimatedMonthlyCost.toLocaleString()}
                    </p>
                  </div>
                  {estimatedMonthlyCost > budgetCap && (
                    <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                  )}
                  {estimatedMonthlyCost <= budgetCap && estimatedMonthlyCost > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Within Budget</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {isNew ? "Create Achievement" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
