import { useRef, useState } from "react";
import SEO from "@/components/SEO";
import { GlassHeader } from "@/landing/header/GlassHeader";
import { Hero } from "@/landing/hero/Hero";
import { Intelligence } from "@/landing/intelligence/Intelligence";
import { Governance } from "@/landing/governance/Governance";
import { Activation } from "@/landing/activation/Activation";
import { LandingFooter } from "@/landing/footer/Footer";
import { RequestAccessModal } from "@/landing/request/RequestAccessModal";
import { useReducedMotion } from "@/landing/useReducedMotion";
import "@/landing/tokens.css";
import "@/landing/landing.css";

export default function LandingPage() {
  const [requestOpen, setRequestOpen] = useState(false);
  const requestTriggerRef = useRef<HTMLButtonElement | null>(null);
  const reducedMotion = useReducedMotion();
  const openRequest = (trigger: HTMLButtonElement) => {
    requestTriggerRef.current = trigger;
    setRequestOpen(true);
  };
  const handleRequestOpenChange = (open: boolean) => {
    setRequestOpen(open);
    if (!open) window.requestAnimationFrame(() => requestTriggerRef.current?.focus());
  };

  return (
    <div className={`ventus-landing ${reducedMotion ? "is-reduced-motion" : ""}`} id="top" data-landing-root>
      <SEO
        title="Ventus AI — Decision Intelligence for Personalized Banking"
        description="Ventus AI brings customer context, bank policy, and activation together through the systems a bank already uses."
        path="/"
        keywords="bank decision intelligence, governed banking personalization, customer intelligence for banks"
        image="/og.png"
      />
      <GlassHeader onRequestAccess={openRequest} />
      <main>
        <Hero onRequestAccess={openRequest} />
        <Intelligence />
        <Governance />
        <Activation onRequestAccess={openRequest} />
      </main>
      <LandingFooter />
      <RequestAccessModal open={requestOpen} onOpenChange={handleRequestOpenChange} />
    </div>
  );
}
