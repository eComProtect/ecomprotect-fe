import { Link } from "react-router-dom";
import logo from "/images/logo.png";

// ─── Typography helpers ───────────────────────────────────────────────────────

// Polaris ships a global CSS rule: h1,h2,h3,h4,h5,h6,p { font-size:1em; font-weight:var(--p-font-weight-regular) }
// That element selector wins over Tailwind v4's :where()-scoped utilities (specificity 0).
// The ! prefix makes the utility !important so our type scale is restored on this public page.
const H2 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h2
    id={id}
    className="mb-4 mt-16 scroll-mt-20 border-b border-gray-200 pb-3 !text-[1.75rem] !font-bold leading-snug text-gray-900"
  >
    {children}
  </h2>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3 mt-8 !text-lg !font-semibold text-gray-800">{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-5 !text-[1.0625rem] leading-[1.75] text-gray-700">{children}</p>
);

const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="mb-5 ml-7 list-disc space-y-2 !text-[1.0625rem] leading-[1.75] text-gray-700">{children}</ul>
);

const LI = ({ children }: { children: React.ReactNode }) => (
  <li>{children}</li>
);

const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">{children}</table>
  </div>
);

const THead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
);

const TH = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
  <th
    className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${wide ? "w-2/3" : ""}`}
  >
    {children}
  </th>
);

const TD = ({ children }: { children: React.ReactNode }) => (
  <td className="px-5 py-4 align-top text-[1.0625rem] leading-[1.7] text-gray-700">{children}</td>
);

const TR = ({ children, shaded }: { children: React.ReactNode; shaded?: boolean }) => (
  <tr className={shaded ? "bg-gray-50" : ""}>{children}</tr>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-[Outfit]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/">
            <img src={logo} alt="eComProtect" className="h-10" />
          </Link>
          <span className="text-sm text-gray-500">Privacy Policy</span>
        </div>
      </header>

      {/* ── Document ── */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <article className="mx-auto max-w-[780px]">
          {/* ── Title block ── */}
          <div className="mb-10">
            <h1 className="mb-4 !text-4xl !font-bold text-gray-900">Privacy Policy</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span><strong>Version:</strong> 1.0</span>
              <span><strong>Effective date:</strong> 1st June 2026</span>
              <span><strong>Last updated:</strong> 1st June 2026</span>
            </div>
          </div>

          {/* ── Purpose & approach ── */}
          <P>
            This Privacy Policy explains how Excevo Ltd trading as eComProtect ("eComProtect",
            "we", "us" or "our") collects, uses, discloses, retains and protects personal data
            when merchants install or use the eComProtect Shopify application and related services
            (the "Service").
          </P>
          <P>
            eComProtect provides risk insights about prior parcel non-receipt and delivery issues.
            A risk indicator is not a finding of fraud, dishonesty or wrongdoing. Merchants remain
            responsible for their fulfilment and customer-service decisions, subject to the
            configurable controls described below.
          </P>

          {/* ── Publication details ── */}
          <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50 p-5 text-sm">
            <p className="mb-2 !text-[1.0625rem] !font-semibold text-gray-800">Publication Details</p>
            <dl className="grid grid-cols-1 gap-y-1 sm:grid-cols-[auto_1fr] sm:gap-x-4 text-gray-700">
              <dt className="font-medium whitespace-nowrap">Legal entity</dt>
              <dd>Excevo Ltd, company number 12980668</dd>
              <dt className="font-medium whitespace-nowrap">Registered office</dt>
              <dd>128 City Road, London, EC1V 2NX</dd>
              <dt className="font-medium whitespace-nowrap">Privacy contact</dt>
              <dd><a href="mailto:admin@excevo.co.uk" className="text-blue-600 hover:underline">admin@excevo.co.uk</a></dd>
              <dt className="font-medium whitespace-nowrap">Data Protection Officer</dt>
              <dd>Simon Kay — <a href="mailto:Simon.Kay@excevo.co.uk" className="text-blue-600 hover:underline">Simon.Kay@excevo.co.uk</a></dd>
              <dt className="font-medium whitespace-nowrap">ICO registration</dt>
              <dd>ZB602725</dd>
              <dt className="font-medium whitespace-nowrap">Service websites</dt>
              <dd>
                <a href="https://www.excevo.co.uk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.excevo.co.uk</a>
                {" "}and{" "}
                <a href="https://www.ecomprotect.co.uk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.ecomprotect.co.uk</a>
              </dd>
              <dt className="font-medium whitespace-nowrap">Hosting regions</dt>
              <dd>United Kingdom</dd>
              <dt className="font-medium whitespace-nowrap">Rights requests</dt>
              <dd><a href="mailto:dpo@excevo.co.uk" className="text-blue-600 hover:underline">dpo@excevo.co.uk</a></dd>
            </dl>
          </div>

          {/* ── 1 ── */}
          <H2 id="who-this-applies-to">1. Who This Policy Applies To</H2>
          <P>This policy applies to:</P>
          <UL>
            <LI>Shopify merchants and their authorised staff who install, configure or use the Service;</LI>
            <LI>customers, recipients and other individuals whose order, account, device or delivery information is processed through the Service; and</LI>
            <LI>visitors who use our website, support channels or other business services.</LI>
          </UL>
          <P>
            A merchant's own privacy notice also applies to personal data collected through that
            merchant's Shopify store. Customers should contact the relevant merchant first about
            the merchant's collection and use of their personal data.
          </P>

          {/* ── 2 ── */}
          <H2 id="our-roles">2. Our Roles Under Data-Protection Law</H2>
          <P>The role we perform depends on the processing activity:</P>
          <P>
            <strong>Merchant-directed processing.</strong> For most order screening, fulfilment
            controls, reporting and support functions performed on a merchant's instructions, the
            merchant is the controller and eComProtect acts as its processor or service provider.
          </P>
          <P>
            <strong>Network risk intelligence.</strong> Where eComProtect determines the purposes
            and essential means of maintaining and using cross-store risk intelligence, platform
            security, abuse prevention, legal compliance or service integrity data, eComProtect
            acts as an independent controller. We use this data only for legitimate
            risk-prevention and service-protection purposes and not to make allegations of fraud.
          </P>
          <P>
            <strong>Business relationship data.</strong> We act as controller for merchant
            account, billing, sales, website, support, audit and security data that we use to run
            our business and administer the Service.
          </P>
          <P>
            Where required, we enter into appropriate data-processing terms with merchants.
            Nothing in this policy changes the allocation of responsibilities in those terms.
          </P>

          {/* ── 3 ── */}
          <H2 id="data-we-collect">3. Personal Data We Collect</H2>

          <H3>3.1 Data received from Shopify and merchants</H3>
          <P>
            <strong>Store and merchant data</strong>, such as shop domain, store name, Shopify
            account identifiers, merchant contact details, staff details, installation details,
            plan and configuration settings.
          </P>
          <P>
            <strong>Order and fulfilment data</strong>, such as order identifier, order date and
            value, currency, fulfilment status, refund or cancellation status, carrier and
            tracking information, delivery method and delivery evidence where enabled.
          </P>
          <P>
            <strong>Customer and recipient identifiers</strong>, such as name, email address,
            telephone number, billing and delivery address, postcode, customer account identifier
            and, where technically available and approved, relevant IP or device/network
            identifiers.
          </P>
          <P>
            <strong>Claims and outcome data</strong>, such as lost, stolen, damaged or "not
            received" reports, dates, merchant review outcomes, waivers, delivery precautions,
            cancellations, refunds and restocking actions.
          </P>
          <P>
            <strong>Risk and matching data</strong>, such as match features, normalised or hashed
            identifiers, similarity scores, number and recency of previous non-receipt claims,
            loss-rate indicators and reason codes shown to the merchant.
          </P>

          <H3>3.2 Data collected directly</H3>
          <P>
            <strong>Account, billing and communications data</strong> supplied by merchants,
            prospective merchants, partners or support users.
          </P>
          <P>
            <strong>Technical and usage data</strong>, such as log-in times, audit events,
            browser/device information, IP address, app actions, API requests, error logs and
            security events.
          </P>
          <P>
            <strong>Support content</strong>, including messages, attachments and call notes
            submitted to us.
          </P>

          <H3>3.3 Data we do not intend to collect</H3>
          <P>
            We do not need full payment-card details and do not intentionally collect
            special-category data (such as health, ethnicity, religion or biometric data) or
            criminal-conviction data. Merchants and users should not submit such information
            unless we have expressly agreed a lawful and necessary process for it.
          </P>

          {/* ── 4 ── */}
          <H2 id="how-we-use-data">4. How We Use Personal Data</H2>
          <UL>
            <LI>Provide, authenticate, configure, maintain and support the Service.</LI>
            <LI>
              Match orders against prior delivery-issue records using exact and fuzzy matching
              techniques that can account for formatting differences, spelling variations,
              postcode spacing and email aliases.
            </LI>
            <LI>
              Generate neutral risk indicators, reason codes, summaries and recommendations for
              merchant review.
            </LI>
            <LI>
              Apply merchant-configured fulfilment controls, such as placing an order on hold,
              requesting an e-sign waiver, requiring signature or photo delivery, delaying an
              action, or cancelling/refunding an order where the merchant has enabled that
              function.
            </LI>
            <LI>
              Produce merchant and internal reports, trend analysis, service-performance metrics
              and estimated loss-prevention value.
            </LI>
            <LI>
              Detect, investigate and prevent unauthorised access, misuse, abuse, security
              incidents and attempts to evade risk controls.
            </LI>
            <LI>
              Comply with legal obligations, enforce agreements, resolve disputes, protect rights
              and respond to lawful requests.
            </LI>
            <LI>
              Improve and develop the Service, using aggregated or de-identified information where
              reasonably possible.
            </LI>
            <LI>
              Communicate with merchants about service notices, account administration, support
              and, where permitted, relevant product information.
            </LI>
          </UL>

          {/* ── 5 ── */}
          <H2 id="lawful-bases">5. Lawful Bases for Processing</H2>
          <Table>
            <THead>
              <TR>
                <TH>Lawful basis</TH>
                <TH wide>Typical use</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD><strong>Contract</strong></TD>
                <TD>
                  To provide the Service to merchants, administer subscriptions, deliver support
                  and take requested steps before entering a contract.
                </TD>
              </TR>
              <TR shaded>
                <TD><strong>Legitimate interests</strong></TD>
                <TD>
                  To prevent and reduce parcel-loss and non-receipt risk; protect merchants,
                  customers and our network; secure and improve the Service; maintain audit
                  records; and manage our business. We assess necessity, proportionality and the
                  impact on individuals, and implement safeguards including data minimisation,
                  access controls, neutral reason codes and review/override mechanisms.
                </TD>
              </TR>
              <TR>
                <TD><strong>Legal obligation</strong></TD>
                <TD>
                  To meet accounting, tax, data-protection, law-enforcement and other applicable
                  legal requirements.
                </TD>
              </TR>
              <TR shaded>
                <TD><strong>Consent</strong></TD>
                <TD>
                  Where the law requires consent, for example for certain optional marketing
                  communications or non-essential cookies. Consent can be withdrawn at any time.
                </TD>
              </TR>
            </TBody>
          </Table>
          <P>
            When we process data as a processor, the merchant determines the lawful basis.
            Merchants are responsible for giving their customers appropriate privacy information
            and ensuring their instructions to us are lawful.
          </P>

          {/* ── 6 ── */}
          <H2 id="risk-matching">6. Risk Matching and Automated Actions</H2>
          <P>
            The Service may compare identifiers and order history across participating stores to
            identify patterns associated with repeated non-receipt or delivery issues. Matching
            may involve normalisation, hashing, exact matching and fuzzy similarity techniques.
            The output is a risk indicator, not a determination that an individual has acted
            dishonestly.
          </P>
          <P>
            Depending on the merchant's settings, an indicator may: (a) place an order on hold
            for manual review; (b) recommend enhanced delivery controls; or (c) trigger a delayed
            or immediate cancellation, refund and restock workflow. The merchant chooses whether
            to enable these options and remains responsible for their configuration and use.
          </P>
          <P>
            Safeguards include configurable thresholds and sensitivity, reason information,
            trusted/exclusion lists, delay options, audit logs and the ability for authorised
            merchant staff to review and override outcomes. Individuals may contact the merchant
            to contest or explain an outcome and may also contact us about data for which
            eComProtect is controller. We do not intentionally use special-category data or
            protected characteristics in risk scoring.
          </P>
          <P>
            Where applicable law restricts decisions based solely on automated processing that
            produce legal or similarly significant effects, merchants must use the Service in a
            manner that provides meaningful human review or another valid legal basis and
            appropriate safeguards.
          </P>

          {/* ── 7 ── */}
          <H2 id="disclosure">7. How We Disclose Personal Data</H2>
          <P>We disclose personal data only as necessary and subject to appropriate safeguards:</P>
          <UL>
            <LI>
              To the merchant that submitted or is reviewing the relevant order, including neutral
              risk reasons and relevant history summaries. We do not provide merchants with
              another merchant's identity or unnecessary details about another store's customer
              relationship.
            </LI>
            <LI>
              To Shopify, where needed to operate the integration, comply with Shopify
              requirements, respond to privacy requests or protect the platform.
            </LI>
            <LI>
              To vetted subprocessors and service providers that support hosting, databases,
              security, communications, analytics, billing, customer support, electronic
              signatures or delivery services. They may process data only under contract and for
              the agreed purpose.
            </LI>
            <LI>
              To professional advisers, auditors, insurers, investors or transaction
              counterparties where reasonably necessary and protected by confidentiality
              obligations.
            </LI>
            <LI>
              To regulators, courts, law-enforcement bodies or other parties where required by
              law or necessary to establish, exercise or defend legal claims or protect rights and
              safety.
            </LI>
          </UL>
          <P>
            We do not sell personal data. We do not share personal data for third-party
            behavioural advertising.
          </P>

          {/* ── 8 ── */}
          <H2 id="shopify-compliance">8. Shopify Privacy and Compliance Requests</H2>
          <P>
            We support Shopify's mandatory privacy mechanisms and applicable data-protection
            requests. The app subscribes to and properly handles Shopify's required compliance
            webhooks, including customer data requests, customer redaction requests and shop
            redaction requests, within Shopify's required timeframes. We may retain limited
            information where legally required or necessary to establish, exercise or defend legal
            claims, and will restrict further use of retained data.
          </P>
          <P>
            Merchants should send requests relating to their customers through the channels
            described in their eComProtect agreement or to{" "}
            <a href="mailto:dpo@excevo.co.uk" className="text-blue-600 hover:underline">
              dpo@excevo.co.uk
            </a>
            . Customers may contact the relevant merchant or eComProtect using the details in
            section 16.
          </P>

          {/* ── 9 ── */}
          <H2 id="international-transfers">9. International Transfers</H2>
          <P>
            Personal data may be processed in the United Kingdom and in other countries where we
            or our subprocessors operate. Where data is transferred outside the UK or another
            jurisdiction that provides adequate protection, we use recognised safeguards such as
            the UK International Data Transfer Agreement, the UK Addendum to the EU Standard
            Contractual Clauses, adequacy regulations, or another lawful transfer mechanism.
            Details may be requested from{" "}
            <a href="mailto:dpo@excevo.co.uk" className="text-blue-600 hover:underline">
              dpo@excevo.co.uk
            </a>
            .
          </P>

          {/* ── 10 ── */}
          <H2 id="data-retention">10. Data Retention</H2>
          <Table>
            <THead>
              <TR>
                <TH>Data category</TH>
                <TH wide>Standard retention approach</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD>Active merchant account and configuration data</TD>
                <TD>For the account term, then 2 years after account closure unless a longer period is required.</TD>
              </TR>
              <TR shaded>
                <TD>Order, delivery issue and risk-history records</TD>
                <TD>2 years from the relevant order or last delivery-issue event, subject to dispute holds and approved network-risk requirements.</TD>
              </TR>
              <TR>
                <TD>Direct identifiers used for cross-store matching</TD>
                <TD>12 months, then deleted or irreversibly anonymised; hashed identifiers remain personal data where they can still be linked or matched.</TD>
              </TR>
              <TR shaded>
                <TD>Waivers and delivery evidence</TD>
                <TD>2 years or the merchant-configured period.</TD>
              </TR>
              <TR>
                <TD>Audit and security logs</TD>
                <TD>12 months, except records linked to an investigation may be retained longer.</TD>
              </TR>
              <TR shaded>
                <TD>Billing, tax and transaction records</TD>
                <TD>Normally 6 years after the relevant financial year, or as required by law.</TD>
              </TR>
              <TR>
                <TD>Support records</TD>
                <TD>24 months after closure.</TD>
              </TR>
              <TR shaded>
                <TD>Backups</TD>
                <TD>Deleted or overwritten on a rolling cycle of approximately 30 days, subject to secure disaster-recovery processes.</TD>
              </TR>
            </TBody>
          </Table>
          <P>
            When a merchant uninstalls the app, we stop collecting new Shopify data and delete or
            anonymise merchant-directed data in accordance with our agreement, Shopify's
            shop-redaction requirements and the schedule above. Some controller records may be
            retained where a valid lawful basis continues to apply.
          </P>

          {/* ── 11 ── */}
          <H2 id="security">11. Security</H2>
          <P>
            We use proportionate technical and organisational measures designed to protect
            personal data, including encryption in transit and at rest, role-based access
            controls, least-privilege access, multi-factor authentication for privileged access
            where supported, environment separation, logging and monitoring, vulnerability
            management, secure development practices, staff confidentiality obligations,
            incident-response procedures and supplier due diligence.
          </P>
          <P>
            No system is completely secure. Merchants must protect their credentials, configure
            staff permissions appropriately and notify us promptly of suspected compromise.
            Unauthorised access is prohibited. Attempting to log in without proper authorisation
            may constitute a criminal offence under UK law.
          </P>

          {/* ── 12 ── */}
          <H2 id="individual-rights">12. Individual Rights</H2>
          <P>
            Subject to applicable law, individuals may have rights to access, correct, erase or
            restrict personal data; object to processing based on legitimate interests; receive
            portable data; withdraw consent; and seek human review of certain automated
            decisions. Rights are not absolute and may be limited where an exemption applies or
            where retention is necessary for legal claims, security, dispute prevention or
            overriding legitimate grounds.
          </P>
          <P>
            For merchant-controlled data, requests should normally be made to the relevant
            merchant. We will assist merchants as required by our contract and applicable law.
            For processing where eComProtect is controller, contact{" "}
            <a href="mailto:dpo@excevo.co.uk" className="text-blue-600 hover:underline">
              dpo@excevo.co.uk
            </a>
            . We may need to verify identity and clarify the scope of a request. We aim to
            respond within the applicable legal timeframe.
          </P>
          <P>
            Individuals may complain to the UK Information Commissioner's Office or another
            competent supervisory authority. We encourage individuals to contact us first so we
            can try to resolve the concern.
          </P>

          {/* ── 13 ── */}
          <H2 id="children">13. Children's Privacy</H2>
          <P>
            The Service is intended for business use by merchants and is not directed to children.
            We do not knowingly collect personal data directly from children through an
            eComProtect account. Order data may incidentally relate to a child where a merchant
            processes an order for or involving that child; the merchant is responsible for
            ensuring a lawful basis and appropriate transparency.
          </P>

          {/* ── 14 — Cookies (populated from real inventory — do not edit without re-auditing) ── */}
          <H2 id="cookies">14. Cookies and Tracking Technologies</H2>
          <P>
            We use a small number of cookies and browser storage mechanisms. The table below is
            the complete list — we do not use any advertising, tracking, or analytics cookies.
          </P>

          <H3>Authentication Cookies</H3>
          <P>
            Set only when you sign in to eComProtect directly (the standalone web app). These
            cookies are <strong>not</strong> set when you access eComProtect from inside Shopify
            Admin — that flow uses short-lived Shopify-issued tokens sent in request headers,
            with no cookies.
          </P>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Purpose</TH>
                <TH>Expires</TH>
                <TH>Type</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD><Code>better-auth.session_token</Code></TD>
                <TD>Identifies your authenticated session. HttpOnly — not accessible to JavaScript.</TD>
                <TD>7 days</TD>
                <TD>Strictly necessary</TD>
              </TR>
              <TR shaded>
                <TD><Code>better-auth.session_data</Code></TD>
                <TD>Short-lived server-side session cache that reduces database lookups on each page request.</TD>
                <TD>5 minutes</TD>
                <TD>Strictly necessary</TD>
              </TR>
            </TBody>
          </Table>

          <H3>App Installation Cookie</H3>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Purpose</TH>
                <TH>Expires</TH>
                <TH>Type</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD><Code>shopify_app_state</Code></TD>
                <TD>
                  CSRF protection during the Shopify OAuth install flow. Set when you begin
                  installing eComProtect and removed immediately after the install completes.
                </TD>
                <TD>Session (transient)</TD>
                <TD>Strictly necessary</TD>
              </TR>
            </TBody>
          </Table>

          <H3>Preference Cookie</H3>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Purpose</TH>
                <TH>Expires</TH>
                <TH>Type</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD><Code>sidebar_state</Code></TD>
                <TD>
                  Remembers whether you have collapsed the navigation sidebar so that your
                  preference persists across page loads.
                </TD>
                <TD>7 days</TD>
                <TD>Functional</TD>
              </TR>
            </TBody>
          </Table>

          <H3>Local Storage</H3>
          <P>
            We store one item in your browser's local storage (not a cookie — never sent to our
            servers):
          </P>
          <Table>
            <THead>
              <TR>
                <TH>Key</TH>
                <TH>Purpose</TH>
                <TH>Removed</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD><Code>eComProtect_welcome_modal_seen</Code></TD>
                <TD>
                  Records that you have dismissed the one-time welcome guide so it is not shown
                  on every visit.
                </TD>
                <TD>When you clear browser data</TD>
              </TR>
            </TBody>
          </Table>
          <P>
            We do not use analytics cookies, advertising cookies, or any third-party tracking
            scripts. No sessionStorage is used.
          </P>

          {/* ── 15 ── */}
          <H2 id="changes">15. Changes to This Policy</H2>
          <P>
            We may update this policy to reflect changes in law, Shopify requirements, our
            Service or our data practices. We will post the updated version at{" "}
            <a
              href="https://www.excevo.co.uk/privacy"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.excevo.co.uk/privacy
            </a>
            , update the "Last updated" date and provide additional notice where required.
            Material changes will not be applied retrospectively where doing so would be unlawful.
          </P>

          {/* ── 16 ── */}
          <H2 id="contact">16. Contact Us</H2>
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
            <p className="mb-1"><strong>Excevo Ltd</strong> trading as eComProtect</p>
            <p className="mb-1">Registered office: 128 City Road, London, EC1V 2NX</p>
            <p className="mb-1">
              Privacy email:{" "}
              <a href="mailto:dpo@excevo.co.uk" className="text-blue-600 hover:underline">
                dpo@excevo.co.uk
              </a>
            </p>
            <p className="mb-1">
              Data Protection Officer: Simon Kay —{" "}
              <a href="mailto:Simon.Kay@excevo.co.uk" className="text-blue-600 hover:underline">
                Simon.Kay@excevo.co.uk
              </a>
            </p>
            <p>ICO registration number: ZB602725</p>
          </div>

          {/* ── 17 ── */}
          <H2 id="merchant-commitments">17. Merchant Implementation Commitments</H2>
          <P>
            To use the Service responsibly and consistently with this policy, merchants should:
          </P>
          <UL>
            <LI>
              Provide customers with clear privacy information explaining the use of
              delivery-risk screening and any significant automated or manual fulfilment controls.
            </LI>
            <LI>
              Configure thresholds, matching sensitivity, exclusions and automatic actions
              proportionately and test them before enabling live enforcement.
            </LI>
            <LI>
              Ensure staff can review risk reasons, consider relevant explanations and override an
              outcome where appropriate.
            </LI>
            <LI>
              Avoid accusatory language and explain that additional delivery precautions reflect
              prior delivery issues or risk indicators, not a finding of wrongdoing.
            </LI>
            <LI>
              Use only the minimum Shopify permissions and personal data needed for the selected
              features.
            </LI>
            <LI>
              Maintain a lawful basis, appropriate contracts, retention settings and procedures
              for handling customer rights requests.
            </LI>
          </UL>
        </article>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Excevo Ltd. All rights reserved.</p>
          <Link to="/signin" className="hover:underline">
            Back to sign in
          </Link>
        </div>
      </footer>
    </div>
  );
};
