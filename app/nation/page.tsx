import { redirect } from "next/navigation";

export default function LegacyNationRedirect() {
  redirect("/play");
}
