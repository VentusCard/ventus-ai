import LandingPage from "@/landing/LandingPage";
import { LandingFonts } from "@/landing/RouteFonts";
import "@/landing/entry.css";

export default function LandingApp() {
  return (
    <>
      <LandingFonts />
      <LandingPage />
    </>
  );
}
