import { WithLayoutLayout } from "../dashboard/layout";
import { Toaster } from "react-hot-toast";

export default function NoteSummaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <WithLayoutLayout>
      <Toaster position="top-right" />
      {children}
    </WithLayoutLayout>
  );
} 