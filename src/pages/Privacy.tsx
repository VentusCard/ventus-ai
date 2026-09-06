import SEO from "@/components/SEO";
import { LANDING_COPY } from "@/landing/copy";

/**
 * Placeholder privacy notice, added so the landing footer's privacy link
 * (docs/finnovate-landing-goal.md §7) resolves instead of 404ing. This is a
 * factual description of what the Request Access form collects and how it
 * is used — it makes no compliance or certification claims and stands in
 * for a full policy pending legal review before Finnovate.
 */
const Privacy = () => {
  return (
    <div className="bg-white">
      <SEO
        title="Privacy — Ventus AI"
        description="How Ventus AI handles information submitted through ventusai.com."
        path="/privacy"
      />
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">Privacy</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Privacy notice</h1>

          <div className="space-y-8 text-gray-600 leading-relaxed">
            <p>
              This notice covers ventusai.com and describes what we collect when you request access
              or otherwise contact us, and how we use it. It does not describe how any bank customer
              data is processed inside a Ventus deployment — that is governed separately, by contract,
              with each institution.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">What we collect</h2>
              <p>
                When you submit the Request Access form, we collect the name, work email, institution,
                role, and optional message you provide. We do not ask for and ask that you not include
                customer, account, or other confidential information in that form.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">How we use it</h2>
              <p>
                We use this information to respond to your request and to follow up about Ventus AI.
                We do not sell this information, and we do not share it with third parties except the
                service providers that operate this form and our email on our behalf.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact</h2>
              <p>
                Questions about this notice or a request to remove your information can be sent to{" "}
                <a href={`mailto:${LANDING_COPY.footer.email}`} className="text-blue-600 hover:underline">
                  {LANDING_COPY.footer.email}
                </a>
                .
              </p>
            </section>

            <p className="text-sm text-gray-400">
              This notice is a placeholder pending full legal review and will be replaced with a
              complete privacy policy before broader release.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
