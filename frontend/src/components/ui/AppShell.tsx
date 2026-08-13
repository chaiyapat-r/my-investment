import { Sidebar } from "./Sidebar";

// Shared chrome for authed pages: one Sidebar + the flex shell. Each page
// supplies its own <main> as children.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {children}
    </div>
  );
}
