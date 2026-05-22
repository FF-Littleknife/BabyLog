import type { BabyRecord } from "@/lib/types";
import FormulaLikeSheet from "./FormulaLikeSheet";

export default function BottleBreastSheet(props: {
  records: BabyRecord[];
  mode: "quick" | "full";
  onClose: () => void;
  onSave: (record: BabyRecord) => void;
}) {
  return (
    <FormulaLikeSheet
      {...props}
      title="瓶喂母乳"
      type="bottle_breast"
    />
  );
}