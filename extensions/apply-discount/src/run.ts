import type {
  RunInput,
  FunctionRunResult,
  Target,
  Value
} from "../generated/api";
import {
  DiscountApplicationStrategy,
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type Configuration = {};

export function run(input: RunInput): FunctionRunResult {
  const discounts: {
    targets: Target[];
    value: Value;
  }[] = [];

  // Process each cart line
  input.cart.lines.forEach((line) => {
    const { merchandise, quantity, cost } = line;
    
    if (merchandise.__typename === "ProductVariant") {
      // Check if MAP is enabled for this product
      const mapEnabled = merchandise.product.metafield?.value === "true";
      
      if (mapEnabled) {
        // Get the final MAP price
        const finalPriceValue = merchandise.metafield?.value;
        
        if (finalPriceValue) {
          const finalPrice = parseFloat(finalPriceValue);
          const currentPrice = parseFloat(cost.amountPerQuantity.amount);
          
          // Only apply discount if current price is higher than MAP price
          if (currentPrice > finalPrice) {
            const discountAmount = currentPrice - finalPrice;
            
            discounts.push({
              targets: [{
                productVariant: {
                  id: merchandise.id,
                  quantity: quantity
                }
              }],
              value: {
                fixedAmount: {
                  amount: discountAmount.toFixed(2)
                }
              }
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
};