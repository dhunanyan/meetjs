import { Dashboard } from "@/components";
import { MswProvider } from "@/context";

export default function Page() {
  return (
    <MswProvider>
      <Dashboard />
    </MswProvider>
  );
}
