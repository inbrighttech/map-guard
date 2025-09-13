import { describe, it, expect } from 'vitest';
import { run } from './run';
import { DiscountApplicationStrategy } from '../generated/api';

describe('MAP Guard discount function', () => {
  it('returns no discounts when no cart lines', () => {
    const result = run({
      cart: {
        lines: []
      },
      discountNode: {
        metafield: null
      }
    } as any);

    expect(result).toEqual({
      discounts: [],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    });
  });

  it('returns no discounts when MAP is not enabled', () => {
    const result = run({
      cart: {
        lines: [{
          quantity: 1,
          merchandise: {
            __typename: 'ProductVariant',
            id: 'gid://shopify/ProductVariant/123',
            product: {
              id: 'gid://shopify/Product/456',
              metafield: {
                value: 'false' // MAP not enabled
              }
            },
            metafield: {
              value: '10.00' // final_price
            }
          },
          cost: {
            amountPerQuantity: {
              amount: '15.00' // current price
            }
          }
        }]
      },
      discountNode: {
        metafield: null
      }
    } as any);

    expect(result).toEqual({
      discounts: [],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    });
  });

  it('applies discount when MAP is enabled and current price > final price', () => {
    const result = run({
      cart: {
        lines: [{
          quantity: 2,
          merchandise: {
            __typename: 'ProductVariant',
            id: 'gid://shopify/ProductVariant/123',
            product: {
              id: 'gid://shopify/Product/456',
              metafield: {
                value: 'true' // MAP enabled
              }
            },
            metafield: {
              value: '10.00' // final_price
            }
          },
          cost: {
            amountPerQuantity: {
              amount: '15.00' // current price
            }
          }
        }]
      },
      discountNode: {
        metafield: null
      }
    } as any);

    expect(result).toEqual({
      discounts: [{
        targets: [{
          productVariant: {
            id: 'gid://shopify/ProductVariant/123',
            quantity: 2
          }
        }],
        value: {
          fixedAmount: {
            amount: '5.00' // 15.00 - 10.00 = 5.00 discount
          }
        }
      }],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    });
  });

  it('returns no discount when current price <= final price', () => {
    const result = run({
      cart: {
        lines: [{
          quantity: 1,
          merchandise: {
            __typename: 'ProductVariant',
            id: 'gid://shopify/ProductVariant/123',
            product: {
              id: 'gid://shopify/Product/456',
              metafield: {
                value: 'true' // MAP enabled
              }
            },
            metafield: {
              value: '15.00' // final_price
            }
          },
          cost: {
            amountPerQuantity: {
              amount: '10.00' // current price (already lower)
            }
          }
        }]
      },
      discountNode: {
        metafield: null
      }
    } as any);

    expect(result).toEqual({
      discounts: [],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    });
  });
});