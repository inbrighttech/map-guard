import type {
  RunInput,
  Target,
  Value
} from "../generated/api";
import {
  DiscountApplicationStrategy,
} from "../generated/api";

const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type Configuration = {};

export function run(input: RunInput) {
  const configuration: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );

  const discounts: {
    targets: Target[];
    value: Value;
  }[] = [];

  // Process each cart line for MAP discounts
  input.cart.lines.forEach((line) => {
    const { merchandise, quantity, cost } = line;
    
    if (merchandise.__typename === "ProductVariant") {
      // Check if MAP is enabled for this variant
      const mapEnabled = merchandise.product?.metafield?.value === "true";
      
      if (mapEnabled) {
        // Get final price from metafield
        const finalPrice = merchandise.metafield?.value;
        
        if (finalPrice) {
          const finalPriceAmount = parseFloat(finalPrice);
          const currentPrice = cost.amountPerQuantity.amount;
          
          // Apply discount if final price is lower
          if (finalPriceAmount < currentPrice) {
            const discountAmount = (currentPrice - finalPriceAmount) * quantity;
            
            discounts.push({
              targets: [
                {
                  productVariant: {
                    id: merchandise.id,
                    quantity: quantity,
                  },
                },
              ],
              value: {
                fixedAmount: {
                  amount: discountAmount.toString(),
                  currencyCode: cost.amountPerQuantity.currencyCode,
                },
              },
            });
          }
        }
      }
    }
  });

  if (discounts.length === 0) {
    return EMPTY_DISCOUNT;
  }

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts,
  };
}