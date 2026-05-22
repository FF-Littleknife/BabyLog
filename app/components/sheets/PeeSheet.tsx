import type { BabyRecord } from "@/lib/types";
import TimeOnlySheet from "./TimeOnlySheet";

export default function PeeSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (record: BabyRecord) => void;
}) {
  return <TimeOnlySheet title="小便" type="pee" onClose={onClose} onSave={onSave} />;
}