# Split Payment Auto-Calculation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live two-method split payment auto-calculation, EBT capping, amount auto-selection, and a compact balance bar to the receive payment panel.

**Architecture:** Keep calculation rules in `cart-payment.logic.ts` and use `cart-payment.tsx` only for form state, focus tracking, and rendering. Preserve existing order-service EBT validation and surcharge enrichment.

**Tech Stack:** React Native, react-hook-form, Jest, React Native Testing Library, Nx.

---

## File Structure

- Modify `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.logic.ts`: add reusable split-balancing helpers.
- Modify `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.logic.spec.ts`: cover helper behavior first.
- Modify `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx`: wire live balancing, field auto-selection, helper labels, and balance bar.
- Modify `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.spec.tsx`: cover cashier-facing integration behavior.

### Task 1: Split-Balancing Helper

**Files:**
- Modify: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.logic.ts`
- Test: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.logic.spec.ts`

- [ ] **Step 1: Write failing helper tests**

Add tests for two-method balancing, EBT capping, and three-method no-op behavior.

- [ ] **Step 2: Run helper tests to verify failure**

Run: `PATH="/Users/orlando/.nvm/versions/node/v20.19.4/bin:$PATH" npx nx test sales-native-feature --testFile=cart-payment.logic.spec.ts --skip-nx-cache`

Expected: fail because the new helper does not exist.

- [ ] **Step 3: Implement helper**

Add a helper that receives payment methods, active methods, changed method, raw values, total, and EBT eligible total. Return normalized values plus metadata for calculated method and capped EBT.

- [ ] **Step 4: Run helper tests to verify pass**

Run the same command and expect pass.

### Task 2: Payment Form Integration

**Files:**
- Modify: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx`
- Test: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.spec.tsx`

- [ ] **Step 1: Write failing component tests**

Add tests for live two-method rebalancing, flipping calculated method after editing it, EBT cap while typing, three-method manual behavior, and input select-on-focus prop.

- [ ] **Step 2: Run component tests to verify failure**

Run: `PATH="/Users/orlando/.nvm/versions/node/v20.19.4/bin:$PATH" npx nx test sales-native-feature --testFile=cart-payment.spec.tsx --skip-nx-cache`

Expected: fail because live balancing and helper UI are not wired.

- [ ] **Step 3: Implement component wiring**

Track the last edited payment method, call the helper from the form watcher, update the calculated method while typing, cap EBT, render helper labels, and render the balance bar only when exactly two methods are active.

- [ ] **Step 4: Run component tests to verify pass**

Run the same command and expect pass.

### Task 3: Full Verification

**Files:**
- No additional files expected.

- [ ] **Step 1: Run focused sales tests**

Run: `PATH="/Users/orlando/.nvm/versions/node/v20.19.4/bin:$PATH" npx nx test sales-native-feature --skip-nx-cache`

Expected: pass.

- [ ] **Step 2: Run mobile app tests**

Run: `PATH="/Users/orlando/.nvm/versions/node/v20.19.4/bin:$PATH" npx nx test mobile-ui --skip-nx-cache`

Expected: pass.

- [ ] **Step 3: Run lint**

Run: `PATH="/Users/orlando/.nvm/versions/node/v20.19.4/bin:$PATH" npx nx lint mobile-ui --skip-nx-cache`

Expected: pass with only pre-existing warnings.
