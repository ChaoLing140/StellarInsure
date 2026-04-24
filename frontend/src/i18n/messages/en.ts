const en = {
  hero: {
    badge: "Trustless Protection",
    title: "Parametric Insurance: Payouts without the paperwork.",
    description:
      "Get protected against verifiable events. No claims adjusters, no delays—just instant, automated payouts directly to your Stellar wallet.",
    primaryCta: "Explore Coverage",
    secondaryCta: "How it works",
    metricsLabel: "Key metrics",
  },
  metrics: {
    processing: "Average automated payout review window",
    availability: "Policy visibility for multilingual customers",
    languages: "Languages available out of the box, including RTL",
  },
  coverage: {
    badge: "Coverage types",
    title: "Insurance experiences designed for clarity",
    description:
      "The frontend now centralizes copy in translation resources so every customer-facing section can be localized without duplicating layout logic.",
    cards: {
      weather: {
        title: "Weather protection",
        description: "Monitor rainfall and drought triggers with concise policy summaries.",
        bullets: [
          "Readable trigger descriptions for agricultural policyholders",
          "Accessible summaries for payout thresholds and claim windows",
        ],
      },
      flight: {
        title: "Flight delay cover",
        description: "Present journey protection terms with prominent alerts and action links.",
        bullets: [
          "Keyboard-first actions for policy lookup and claims",
          "Screen-reader-friendly status messaging for delay outcomes",
        ],
      },
      defi: {
        title: "DeFi risk cover",
        description: "Explain smart contract coverage in modular cards ready for new locales.",
        bullets: [
          "Consistent terminology across claims, payouts, and monitoring",
          "Bi-directional layout support for LTR and RTL languages",
        ],
      },
    },
  },
  workflow: {
    badge: "Workflow",
    title: "A frontend foundation that scales with product and compliance needs",
    description:
      "The new shell combines focus management, skip navigation, and reusable translation hooks so new screens can stay compliant without rebuilding accessibility basics.",
    userJourney: {
      title: "Customer journey",
      steps: [
        "Choose a policy type from a clearly labeled hero section.",
        "Navigate through coverage cards, workflow details, and action links by keyboard.",
        "Switch languages without losing orientation or text direction.",
      ],
    },
    accessibility: {
      title: "Accessibility controls",
      steps: [
        "Use the skip link to jump straight into the main content region.",
        "Track locale changes through a live region announcement.",
        "Keep navigation landmarks and headings consistent for screen readers.",
      ],
    },
  },
  languageSelector: {
    label: "Language selector",
    group: "Choose application language",
    english: "English",
    arabic: "Arabic",
    switched: "Language updated to English.",
  },
  nav: {
    label: "Main navigation",
    overview: "Overview",
    policies: "Policies",
    history: "History",
  },
  maintenance: {
    badge: "Maintenance notice",
    regionLabel: "Platform maintenance notice",
    windowLabel: "Downtime window",
    windowFallback: "Downtime window will be confirmed soon.",
    status: {
      active: "Maintenance is currently active",
      scheduled: "Maintenance is scheduled",
    },
  },
  createPolicy: {
    "eyebrow": "Create Policy",
    "title": "Protect Your Assets",
    "description": "Configure a parametric insurance policy and submit it directly to the Stellar network.",
    "steps": {
      "selectType": "Select Type",
      "configure": "Configure",
      "review": "Review",
      "submit": "Submit"
    },
    "typeSection": {
      "title": "Choose a Policy Type",
      "desc": "Select the type of parametric coverage that fits your needs."
    },
    "configSection": {
      "title": "Configure Your Policy",
      "desc": "Set the coverage parameters for your policy.",
      "coverageLabel": "Coverage Amount (XLM)",
      "coverageHint": "Maximum payout if the trigger condition is met.",
      "premiumLabel": "Premium (XLM)",
      "premiumHint": "One-time payment to activate the policy.",
      "triggerLabel": "Trigger Condition Builder",
      "triggerHint": "Build rules using logical operators. The condition evaluates in real-time.",
      "durationLabel": "Duration (days)",
      "durationHint": "How long the policy stays active."
    },
    "oracleSection": {
      "eyebrow": "Oracle Sources",
      "title": "Select a trigger data provider",
      "desc": "Confidence scores are updated before submission. Fallback routing is shown per provider.",
      "empty": "This policy type has no oracle feeds yet. Select another policy type to continue."
    },
    "reviewSection": {
      "title": "Review Your Policy",
      "desc": "Confirm the details below before submitting to the Stellar network.",
      "triggerCondition": "Trigger Condition"
    },
    "submitSection": {
      "title": "Submitting Your Policy",
      "desc": "Follow the progress of your on-chain transaction below."
    },
    "receipt": {
      "title": "Policy Created Successfully",
      "desc": "Your policy has been confirmed on the Stellar network.",
      "nextSteps": "Next Steps",
      "share": "Share Receipt",
      "download": "Download Receipt",
      "viewHistory": "View Transaction History",
      "createAnother": "Create Another Policy"
    },
    "actions": {
      "back": "Back",
      "continue": "Continue to Review",
      "signSubmit": "Sign and Submit",
      "discard": "Discard Draft"
    }
  },
  history: {
    "eyebrow": "Transaction History",
    "title": "Your On-Chain Activity",
    "desc": "View all your premium payments, claim payouts, and refunds with direct links to Stellar Explorer.",
    "filters": {
      "type": "Type",
      "allTypes": "All Types",
      "status": "Status",
      "allStatuses": "All Statuses",
      "found": "transactions found",
      "updating": "Updating results...",
      "upToDate": "Filters are up to date."
    },
    "table": {
      "date": "Date",
      "type": "Type",
      "amount": "Amount (XLM)",
      "status": "Status",
      "hash": "Hash",
      "details": "Details"
    },
    "empty": "No transactions match your filters."
  },
  policyList: {
    "eyebrow": "My Policies",
    "title": "Your Insurance Policies",
    "desc": "Manage your active parametric insurance policies, view coverage details, and track claim status with full transparency.",
    "filters": {
      "startDate": "Start Date",
      "endDate": "End Date",
      "minCoverage": "Min Coverage ($)",
      "maxCoverage": "Max Coverage ($)",
      "sortBy": "Sort By",
      "newest": "Newest First",
      "highest": "Highest Coverage"
    },
    "empty": {
      "title": "No policies found",
      "desc": "No policies match your current filters.",
      "cta": "Create your first policy"
    }
  },
  policyDetail: {
    "eyebrow": "Policy Detail",
    "desc": "Print-ready policy and claim details with a mobile-friendly assistance form for follow-up review.",
    "actions": {
      "payPremium": "Pay Premium",
      "print": "Print",
      "back": "Back to history"
    },
    "summary": {
      "reference": "Policy reference",
      "coverage": "Coverage",
      "premium": "Premium",
      "type": "Type",
      "destination": "Destination",
      "startDate": "Start date",
      "endDate": "End date",
      "triggerCondition": "Trigger condition",
      "claimWindow": "Claim window"
    },
    "note": {
      "label": "Print note",
      "title": "Export summary",
      "item1": "Optimized for A4 and letter print layouts.",
      "item2": "Action controls are automatically hidden when printing.",
      "item3": "Claim evidence and status remain readable in grayscale."
    },
    "claims": {
      "eyebrow": "Claims",
      "title": "Claim activity",
      "desc": "Review status history before exporting or sending the policy packet.",
      "emptyTitle": "No claims filed yet",
      "emptyDesc": "This policy is active and ready for automated review, but there are no claim records to print yet.",
      "reference": "Claim reference",
      "submitted": "Submitted",
      "amount": "Requested amount",
      "evidence": "Evidence bundle"
    }
  },
} as const;

export default en;
