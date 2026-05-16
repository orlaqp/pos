import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import type {
  DiscountDefinitionSeedRecord,
  DryRunReport,
  ProductRecord,
  SeededDiscountSummary,
  SelectedSeedTargets,
} from './types';

const money = (value: number) => `$${value.toFixed(2)}`;

const linePercent = (price: number, pct: number) => Number(((price * pct) / 100).toFixed(2));

const markdown = (
  summary: SeededDiscountSummary,
  definitions: DiscountDefinitionSeedRecord[],
  targets: SelectedSeedTargets
) => {
  const auto10Discount = linePercent(targets.excludedOilProduct.price, 10);
  const auto15Discount = linePercent(targets.nonExcludedOilProduct.price, 15);
  const rice15Discount = linePercent(targets.riceProduct.price, 15);
  const save5Subtotal = Number(
    (targets.riceProduct.price + targets.nonExcludedOilProduct.price).toFixed(2)
  );
  const save5ThresholdTotal = Number((save5Subtotal - 5).toFixed(2));

  return `# Discount QA Plan\n\n` +
    `Tenant: \`${summary.tenantId}\`\n\n` +
    `Selected store: ${targets.store ? `${targets.store.name} (\`${targets.store.id}\`)` : 'None'}\n\n` +
    `Selected products:\n` +
    `- Excluded oil product: ${targets.excludedOilProduct.name} (${money(targets.excludedOilProduct.price)})\n` +
    `- Non-excluded oil product: ${targets.nonExcludedOilProduct.name} (${money(targets.nonExcludedOilProduct.price)})\n` +
    `- Rice product: ${targets.riceProduct.name} (${money(targets.riceProduct.price)})\n` +
    `- Weighted product: ${targets.weightedProduct.name} (${money(targets.weightedProduct.price)} / ${targets.weightedProduct.unitOfMeasure})\n` +
    `- EBT product: ${targets.ebtProduct.name} (${money(targets.ebtProduct.price)})\n` +
    `- Non-EBT product: ${targets.nonEbtProduct.name} (${money(targets.nonEbtProduct.price)})\n\n` +
    `Seeded discounts:\n` +
    definitions.map((definition) => `- ${definition.name}${definition.code ? ` (\`${definition.code}\`)` : ''}`).join('\n') +
    `\n\n## Manual Scenarios\n\n` +
    `1. Automatic category discount applies\n` +
    `   Use ${targets.excludedOilProduct.name}. Expected subtotal ${money(targets.excludedOilProduct.price)}, discount ${money(auto10Discount)}, total ${money(targets.excludedOilProduct.price - auto10Discount)}.\n\n` +
    `2. Automatic exclusion + best-price-only\n` +
    `   Use ${targets.nonExcludedOilProduct.name}. Expected 15% discount ${money(auto15Discount)} from the exclusion-aware oil rule. The 10% oil rule should not stack because both are BEST_PRICE_ONLY.\n\n` +
    `3. Promo code order discount threshold met\n` +
    `   Add ${targets.riceProduct.name} and ${targets.nonExcludedOilProduct.name}, then apply \`SAVE5\`. Subtotal ${money(save5Subtotal)}. If subtotal is at least $30.00 after adding enough quantity, expected extra order discount $5.00 and total reduced accordingly.\n\n` +
    `4. Promo code rejected below threshold\n` +
    `   With a basket below $30.00, apply \`SAVE5\`. Expected: promo saved in UI if allowed, but order discount remains $0.00.\n\n` +
    `5. Promo line + order promo interaction\n` +
    `   Add two ${targets.riceProduct.name} items and enough ${targets.nonExcludedOilProduct.name} to exceed $30.00. Apply \`RICE15\` and \`SAVE5\`. Expected: rice line gets 15% off first, then $5.00 order discount prorates across lines.\n\n` +
    `6. Final-price promo on weighted item\n` +
    `   Add ${targets.weightedProduct.name} and apply \`MEAT999\`. Expected: line final price is capped by the final-price discount rule, and the line remains exclusive.\n\n` +
    `7. Manual line discount with admin policy\n` +
    `   Sign in as an Admin employee and apply a 10% manual line discount. Expected: allowed without approval.\n\n` +
    `8. Manual order discount requiring approval for sales\n` +
    `   Sign in as a Sales employee and apply an order discount above the role threshold. Expected: approval required warning or rejection until an approver is provided.\n\n` +
    `9. Time/day/store scoped rule inactive\n` +
    `   On a non-Sunday or outside 08:00-12:00, the Sunday oil rule should not apply.\n\n` +
    `10. Time/day/store scoped rule active\n` +
    `   On Sunday between 08:00 and 12:00 at ${targets.store ? targets.store.name : 'the selected store'}, add ${targets.nonExcludedOilProduct.name}. Expected extra Sunday oil discount.\n\n` +
    `11. Mixed EBT and non-EBT basket\n` +
    `   Add ${targets.ebtProduct.name} and ${targets.nonEbtProduct.name}, then apply any eligible promo. Expected: discount affects pricing, but EBT allocation still only covers EBT-eligible subtotal.\n\n` +
    `12. Refund/open-order flow\n` +
    `   Complete a discounted order and open it in Paid/Refunded within 3 days. Expected: discount summary survives restore and refund screens stay responsive.\n`;
};

export const writeQaPlan = (
  outputPath: string,
  summary: SeededDiscountSummary,
  definitions: DiscountDefinitionSeedRecord[],
  targets: SelectedSeedTargets
) => {
  const absolutePath = resolve(outputPath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, markdown(summary, definitions, targets), 'utf8');
  return absolutePath;
};
