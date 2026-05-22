import type { BabyRecord } from "@/lib/types";
import FormulaLikeSheet from "./FormulaLikeSheet";

export default function FormulaSheet(props: {
  records: BabyRecord[];
  mode: "quick" | "full";
  onClose: () => void;
  onSave: (record: BabyRecord) => void;
}) {
  return (
    <FormulaLikeSheet
      {...props}
      title="奶粉"
      type="formula"
    />
  );
}