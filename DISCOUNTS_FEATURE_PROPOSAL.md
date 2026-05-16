# Discounts Feature Proposal

## Proposal Summary

This proposal covers the delivery of a complete **Discounts feature module** for the POS platform, designed to give store operators and managers controlled, auditable, and flexible pricing tools directly inside the application.

The module is built to support day-to-day retail operations while protecting margins through role-based controls, approval rules, and reporting visibility.

## Customer Objective

Enable the business to:

- apply discounts consistently at the register
- support promo code campaigns
- control who can discount and by how much
- handle price overrides with proper approval rules
- monitor discount usage and exceptions
- keep discount data available in a local-first POS workflow

## Included Scope

### 1. Discount Definitions

Configurable discount records that can be created and managed from Back Office, including:

- standard discounts
- automatic discounts
- promo-code discounts
- order-level discounts
- line-item discounts
- percent-based discounts
- fixed-amount discounts
- optional approval requirement
- optional reason requirement
- active/inactive state

### 2. Promo Codes

Promo code support for front-of-house operations, including:

- promo code entry at the register
- promo code validation
- multiple reusable offers managed centrally
- reporting visibility for promo-driven discounts

### 3. Discount Policies

Managerial controls for discount governance, including:

- role-based discount permissions
- employee-specific discount rules
- maximum manual percent discount
- maximum manual amount discount
- maximum price override amount
- required reason for manual discounts
- approval requirement for price overrides
- ability to enable or block promo code usage by role/policy

### 4. Register-Level Discount Actions

Discounting tools available during sales flow, including:

- manual order discount
- manual line-item discount
- promo code application
- price override
- pricing warnings when policy thresholds are exceeded

### 5. Discount Exceptions and Audit Visibility

Operational visibility into pricing issues and review cases, including:

- exception tracking
- severity-based exception records
- review screens in Back Office
- reporting for discount activity

### 6. Reporting and Operational Insight

Reporting coverage for discount activity, including:

- discount reporting
- promo code usage visibility
- refund/void visibility alongside pricing activity
- EBT-related sales visibility where applicable

### 7. Local-First / Sync-Aware Support

The Discounts module follows the application’s local-first direction, which means:

- discount data is available to the POS client as part of local cached business data
- pricing behavior continues to work within the app’s synchronization model
- discount and policy updates participate in outbound sync and reconciliation flows

## Business Value

This feature gives the customer:

- stronger pricing control at the register
- fewer unauthorized discounts
- better margin protection
- cleaner promotional execution
- improved accountability by employee and role
- better auditability for disputes and reporting

## Deliverables

The customer receives:

- Back Office discount management screens
- promo code management
- discount policy configuration
- exception visibility
- register-side discount actions
- reporting support for discounts and promo use
- sync-compatible discount data handling
- QA-tested implementation within the native POS application

## Functional Detail

### Back Office

- create and edit discount definitions
- create and edit promo code offers
- create and edit discount policies
- review discount exceptions
- manage active/inactive pricing rules

### Sales Flow

- cashier enters promo code
- cashier applies line or order discount when allowed
- manager/authorized employee can override price
- app enforces configured rules and warnings
- cart reflects discount totals and pricing impact immediately

### Compliance and Control

- reason-required workflows for manual discounts
- approval-sensitive overrides
- role-based restrictions
- employee-level policy enforcement

## Assumptions

- this proposal covers the Discounts module already scoped in the current POS implementation
- payment processor-funded offers, loyalty engine integration, and third-party coupon clearing are not included unless added by change request
- advanced enterprise promotion logic such as buy-one-get-one campaign engines, scheduled campaign calendars, or basket-rule marketing engines would be separate scope

## Implementation Status

This module is positioned as an implemented feature set within the POS product, including discount management, policy enforcement, register application, and reporting support.

If requested, this can be presented to the customer as:

- a completed delivered module, or
- a commercial module proposal for rollout, configuration, and final acceptance

## Pricing

### Recommended Fixed Price

| Item | Description | Price |
|---|---|---:|
| Discounts Module | Discount definitions, promo codes, policies, exceptions, register-side discount actions, reporting integration | $8,500 |
| Configuration & UAT Support | Customer setup assistance, validation, acceptance support | $1,500 |
| Go-Live Support | Post-release stabilization window | $1,000 |
| **Total** |  | **$11,000** |

### Optional Add-Ons

| Add-On | Description | Price |
|---|---|---:|
| Staff Training Session | Remote walkthrough for managers and operators | $750 |
| Extended Warranty / Support | Ongoing support and small adjustments | $450 / month |
| Advanced Promotion Engine | Custom campaign logic beyond current scope | Quoted separately |

## Commercial Notes

- pricing is for the Discounts feature scope described in this proposal
- any change outside this scope is handled through a separate estimate
- taxes, third-party fees, and external service costs are excluded unless explicitly listed

## Suggested Payment Terms

- 50% to schedule and confirm scope
- 40% at customer review / UAT
- 10% at final acceptance or go-live

## Acceptance Criteria

The Discounts module is considered accepted when the customer confirms:

- discounts can be created and edited
- promo codes can be created and applied
- policy rules are enforced in the sales flow
- price overrides and manual discounts respect configured limits
- reporting reflects discount activity
- the feature works in the agreed POS environments

## Recommended Customer-Facing Positioning

This module should be presented as a **controlled pricing and promotions package** rather than just a simple discount tool.

Recommended positioning line:

> The Discounts feature gives your business controlled promotional flexibility at the register while maintaining manager oversight, employee accountability, and reporting visibility.

## Next Step

If approved, the next step is to confirm:

- final commercial number
- rollout environment
- any customer-specific policy defaults
- training and support preferences

