import { AppShell } from "@/components/ui/AppShell";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

// Layout for authed pages ("(app)" route group — the group name doesn't affect
// URLs). Renders the shared Sidebar once; each page supplies its own <main>.
// ConfirmProvider makes useConfirm() available to all pages here.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <AppShell>{children}</AppShell>
    </ConfirmProvider>
  );
}
