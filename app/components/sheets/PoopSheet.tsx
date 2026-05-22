import type { BabyRecord } from "@/lib/types";
import TimeOnlySheet from "./TimeOnlySheet";

export default function PoopSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (record: BabyRecord) => void;
}) {
  return <TimeOnlySheet title="大便" type="poop" onClose={onClose} onSave={onSave} />;
}