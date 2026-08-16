// "/terms": Terms & Conditions page. Structured around South Africa's
// ECTA (mandatory e-commerce disclosures + 7-day cooling-off right) and
// CPA (consumer protection / returns for defective goods), since that's
// the law that actually applies to this store. Sections marked
// [PLACEHOLDER] need real business details filled in before this is
// relied on - this is a solid starting draft, not a substitute for a
// lawyer's review.
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <section className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Last updated: 16 August 2026
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            These Terms &amp; Conditions ("Terms") govern your use of the TC
            PlayBricks website and any purchase you make through it. By
            using this site or placing an order, you agree to these Terms.
            If you do not agree, please do not use the site.
          </p>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              1. Who We Are
            </h2>
            <p>
              TC PlayBricks ("we", "us", "our") sells second‑hand, rare, and
              retired LEGO® sets online to consumers in South Africa.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Trading name: TC PlayBricks</li>
              <li>
                Registered company: New United South African Financial and
                Business Consultants (N.U.S.A.F.B.C)
              </li>
              <li>Company registration number: 1998/073216/23</li>
              <li>
                Physical business address: 15 Kleinbosch Crescent,
                Kleinbosch, 7500, South Africa
              </li>
              <li>
                Email:{" "}
                <a
                  href="mailto:tanijac4@gmail.com"
                  className="text-red-600 hover:underline"
                >
                  tanijac4@gmail.com
                </a>{" "}
                (email is our only contact channel - we do not offer phone
                support)
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-500">
              This information is a legal requirement under section 43 of
              the Electronic Communications and Transactions Act (ECTA) -
              South African online stores must clearly disclose who they
              are and how to contact them.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              2. Products
            </h2>
            <p>
              <strong>All products sold on this site are second‑hand.</strong>{" "}
              We sell rare and retired LEGO sets that have previously been
              opened and/or built. Some sets may still include their
              original packaging, but the contents should not be considered
              "new" or "factory sealed" unless explicitly stated otherwise
              in the product listing. Some sets are sold pre‑built and are
              then carefully broken down and packaged piece-by-piece for
              shipping. Product photos are for illustration; actual box and
              piece condition may vary between individual items given their
              second-hand nature.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              3. Accounts
            </h2>
            <p>
              You need an account to purchase. You're responsible for
              keeping your login details secure and for all activity under
              your account. Use a strong, unique password.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              4. Pricing &amp; Payment
            </h2>
            <p>
              All prices are listed in South African Rand (ZAR). TC
              PlayBricks is not a VAT-registered vendor, so no VAT is
              charged on orders. A delivery fee is calculated at checkout
              based on parcel size and shown before you pay. All payments
              are processed securely through PayFast; we do not store your
              card details. We reserve the right to correct pricing errors
              before an order is confirmed as paid.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              5. Orders &amp; Delivery
            </h2>
            <p>
              An order is only confirmed once payment has been successfully
              processed. We aim to dispatch orders within 2-3 business days
              via PUDO parcel locker delivery. Delivery times are
              estimates, not guarantees.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              6. Your Right to Cancel (Cooling-Off Period)
            </h2>
            <p>
              Under section 44 of ECTA, you may cancel an order without
              reason or penalty within 7 days of receiving the goods,
              except where the goods have been unpacked/used in a way that
              affects their resale value, or for other categories excluded
              by law. To cancel or request a refund, email us at{" "}
              <a
                href="mailto:tanijac4@gmail.com"
                className="text-red-600 hover:underline"
              >
                tanijac4@gmail.com
              </a>
              . We will process the refund within 30 days of receiving the
              returned item. You are responsible for return shipping unless
              the item is defective or not as described.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              7. Defective or Incorrect Items
            </h2>
            <p>
              If an item arrives damaged, defective, or different from what
              you ordered, email us at{" "}
              <a
                href="mailto:tanijac4@gmail.com"
                className="text-red-600 hover:underline"
              >
                tanijac4@gmail.com
              </a>{" "}
              within 7 days of delivery. In line with the Consumer
              Protection Act, you're entitled to a repair, replacement, or
              refund for defective goods - note that because our products
              are second-hand, normal wear consistent with their listed
              condition is not considered a defect.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              8. Trademarks
            </h2>
            <p>
              LEGO® and the LEGO logo are trademarks of the LEGO Group,
              which does not sponsor, authorize, or endorse this site. We
              are an independent reseller of genuine LEGO products.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              9. Limitation of Liability
            </h2>
            <p>
              To the extent permitted by law, TC PlayBricks is not liable
              for indirect or consequential losses arising from your use of
              this site. Nothing in these Terms limits any right you have
              under the Consumer Protection Act that cannot lawfully be
              excluded.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              10. Privacy
            </h2>
            <p>
              We collect and use personal information (such as your email
              and order details) to process orders and run your account, in
              line with the Protection of Personal Information Act (POPIA).
              See our{" "}
              <Link to="/privacy" className="text-red-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              for full details on what we collect and your rights.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              11. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of
              the site after changes are posted means you accept the
              updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              12. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the Republic of South
              Africa, and any dispute will be subject to the jurisdiction
              of the South African courts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
