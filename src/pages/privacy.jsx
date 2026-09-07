// "/privacy": Privacy Policy page, structured around POPIA (Protection of
// Personal Information Act) section 18's mandatory notice requirements -
// what we collect, why, who it's shared with, and the data subject's
// rights (including the right to complain to the Information Regulator).
// Uses the same company details already confirmed for the Terms page.
export default function Privacy() {
  return (
    <section className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Last updated: 7 September 2026
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            This Privacy Policy explains what personal information TC
            PlayBricks collects when you use this site, why we collect it,
            and what rights you have over it, in line with South Africa's
            Protection of Personal Information Act (POPIA).
          </p>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              1. Who Is Responsible For Your Information
            </h2>
            <p>
              TC PlayBricks, trading under New United South African
              Financial and Business Consultants (N.U.S.A.F.B.C), company
              registration number 1998/073216/23, of 15 Kleinbosch
              Crescent, Kleinbosch, 7500, South Africa, is the "responsible
              party" under POPIA for the personal information described
              below. For any privacy question or request, email{" "}
              <a
                href="mailto:tanijac4@gmail.com"
                className="text-red-600 hover:underline"
              >
                tanijac4@gmail.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              2. What We Collect
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Your email address, used to create and log in to your account</li>
              <li>
                Your password - stored securely as a one-way hash by our
                auth provider; we never see or store it in plain text
              </li>
              <li>
                If you sign in with Google, the email address Google
                shares with us
              </li>
              <li>Your cart contents and order/purchase history</li>
              <li>
                Payment confirmation details from PayFast (e.g. that a
                payment succeeded) - we do not collect or store your card
                or bank details ourselves
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              3. Cookies &amp; Local Storage
            </h2>
            <p>
              We don't use cookies for advertising, tracking, or analytics,
              and this site doesn't set any cookies of its own. The only
              thing stored in your browser is your login session, kept
              using your browser's local storage (not a cookie) so you stay
              logged in between visits - this is strictly necessary for the
              site to work and is removed if you log out. If you sign in
              with Google or pay via PayFast, those pages are hosted on
              Google's and PayFast's own sites, and any cookies set there
              are covered by their respective privacy policies, not ours.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              4. Why We Collect It
            </h2>
            <p>
              We use your information to create and manage your account,
              process and fulfil your orders, calculate delivery fees,
              process payments, and communicate with you about your orders
              (e.g. refund requests). If you don't provide an email
              address, you won't be able to create an account or purchase
              anything on this site.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              5. Who We Share It With
            </h2>
            <p>We share limited personal information with:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Supabase</strong> - our database, authentication,
                and hosting provider, which stores your account and order
                data on our behalf. Supabase's infrastructure for this site
                is hosted in the European Union, meaning your data is
                transferred outside South Africa. The EU has data
                protection standards recognised as adequate under POPIA.
              </li>
              <li>
                <strong>PayFast</strong> - our payment processor, which
                handles your payment directly; we only receive confirmation
                that payment succeeded or failed.
              </li>
              <li>
                <strong>Google</strong> - only if you choose to sign in
                with Google, in which case Google shares your email address
                with us as part of that sign-in.
              </li>
            </ul>
            <p className="mt-2">
              We do not sell your personal information to anyone.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              6. How Long We Keep It
            </h2>
            <p>
              We keep your account and order information for as long as
              your account is active, and afterward for as long as needed
              to meet our legal and tax record-keeping obligations. You can
              ask us to delete your account at any time (see section 7).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              7. Your Rights
            </h2>
            <p>Under POPIA, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Ask us what personal information we hold about you</li>
              <li>Ask us to correct inaccurate information</li>
              <li>
                Ask us to delete your account and associated personal
                information, subject to our legal record-keeping
                obligations (e.g. completed order records)
              </li>
              <li>Object to how we process your information</li>
              <li>
                Lodge a complaint with the Information Regulator (contact
                details in section 9) if you believe we've handled your
                information unlawfully
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email{" "}
              <a
                href="mailto:tanijac4@gmail.com"
                className="text-red-600 hover:underline"
              >
                tanijac4@gmail.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              8. Security
            </h2>
            <p>
              We restrict access to your data so that only you can view or
              change your own account, cart, and order information.
              Passwords are never stored in plain text. No online system is
              100% secure, but we take reasonable technical steps to
              protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              9. The Information Regulator
            </h2>
            <p>
              If you're unhappy with how we've handled a privacy concern,
              you can contact South Africa's Information Regulator:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                Email:{" "}
                <a
                  href="mailto:POPIAComplaints@inforegulator.org.za"
                  className="text-red-600 hover:underline"
                >
                  POPIAComplaints@inforegulator.org.za
                </a>
              </li>
              <li>
                Address: Woodmead North Office Park, 54 Maxwell Drive,
                Woodmead, Johannesburg, 2191
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes
              will be posted on this page with an updated "Last updated"
              date.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
