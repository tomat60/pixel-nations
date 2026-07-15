import { redirect } from "next/navigation";

export default function LegacySettlementRedirect() {
  redirect("/play");
}
