import { redirect } from "next/navigation";

// The weekly-entry form is now the "บันทึกยอด" modal on the dashboard, so this
// standalone route is retired — send any old link back to the dashboard.
export default function EntryRedirect() {
  redirect("/");
}
