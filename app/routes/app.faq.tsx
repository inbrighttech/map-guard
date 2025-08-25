import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineStack,
  Badge,
  Banner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export default function FAQPage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const FAQSection = ({ 
    id, 
    title, 
    questions,
    mainQuestions = 3
  }: { 
    id: string; 
    title: string; 
    questions: { q: string; a: string | JSX.Element }[];
    mainQuestions?: number;
  }) => {
    const mainQs = questions.slice(0, mainQuestions);
    const additionalQs = questions.slice(mainQuestions);
    const hasMoreQuestions = additionalQs.length > 0;

    return (
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h2">
              {title}
            </Text>
            {hasMoreQuestions && (
              <Button
                variant="tertiary"
                onClick={() => toggleSection(id)}
                disclosure={openSections[id] ? "up" : "down"}
              >
                {openSections[id] ? "Show Less" : `Show More (${additionalQs.length})`}
              </Button>
            )}
          </InlineStack>

          <BlockStack gap="300">
            {/* Always show main questions */}
            {mainQs.map((faq, index) => (
              <div key={index}>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3" tone="subdued">
                    Q: {faq.q}
                  </Text>
                  <div style={{ color: 'var(--p-color-text)' }}>
                    <strong>A:</strong> {faq.a}
                  </div>
                </BlockStack>
                {(index < mainQs.length - 1 || (hasMoreQuestions && openSections[id])) && <Divider />}
              </div>
            ))}

            {/* Show additional questions when expanded */}
            {hasMoreQuestions && openSections[id] && (
              <>
                {additionalQs.map((faq, index) => (
                  <div key={`additional-${index}`}>
                    <BlockStack gap="200">
                      <Text variant="headingSm" as="h3" tone="subdued">
                        Q: {faq.q}
                      </Text>
                      <div style={{ color: 'var(--p-color-text)' }}>
                        <strong>A:</strong> {faq.a}
                      </div>
                    </BlockStack>
                    {index < additionalQs.length - 1 && <Divider />}
                  </div>
                ))}
              </>
            )}
          </BlockStack>
        </BlockStack>
      </Card>
    );
  };

  const generalFAQs = [
    {
      q: "What is MAP (Minimum Advertised Price) pricing?",
      a: "MAP pricing is a policy set by manufacturers that establishes the lowest price at which retailers can advertise their products. It helps maintain brand value and prevents price wars between retailers."
    },
    {
      q: "How does MAP Guard help my Shopify store?",
      a: "MAP Guard helps you comply with manufacturer MAP policies by managing pricing visibility on your storefront, tracking compliance, and providing tools to set appropriate pricing while maintaining customer relationships."
    },
    {
      q: "Is MAP Guard compatible with all Shopify themes?",
      a: "Yes! MAP Guard uses smart CSS selectors that work with most Shopify themes. The price strike-through feature automatically detects price elements regardless of theme structure."
    },
    {
      q: "Can I customize the messages shown to customers?",
      a: "Absolutely! You can set default messages in the theme editor and override them with custom messages per product variant using metafields."
    },
    {
      q: "Does MAP Guard affect my store's performance?",
      a: "No, MAP Guard is optimized for performance. The theme block uses efficient JavaScript and CSS that doesn't impact page load times."
    },
    {
      q: "What happens if I don't set up metafields?",
      a: "The admin blocks will show placeholder data and the theme block will use default messages. For full functionality, you should create the metafield definitions in the Setup page."
    }
  ];

  const setupFAQs = [
    {
      q: "How do I get started with MAP Guard?",
      a: "Start by going to the Setup page and clicking 'Create Missing Metafields'. This sets up the required data storage for MAP Guard to work properly with your products and variants."
    },
    {
      q: "Why do I need to create these data fields?",
      a: "These data fields (called metafields) allow MAP Guard to store MAP prices, settings, and custom messages directly in Shopify. Without them, the admin tools won't be able to save your MAP configuration."
    },
    {
      q: "What happens if I accidentally delete the setup data?",
      a: "Deleting the setup data will remove MAP prices and settings from all products and variants. The MAP Guard blocks will fall back to default behavior. You can recreate the setup from the Setup page, but you'll need to reconfigure your products."
    },
    {
      q: "Can I modify the data fields after creating them?",
      a: "Once created, the data fields cannot be easily modified through MAP Guard. You would need to delete and recreate them, which will lose existing data. It's best to set them up correctly the first time using our Setup page."
    },
    {
      q: "How do I know if the setup worked correctly?",
      a: (
        <span>
          After completing setup, visit any product page in your admin. You should see the MAP Guard admin block with options to set MAP prices. 
          Look for <Badge tone="success">Created</Badge> status on the Setup page.
        </span>
      )
    },
    {
      q: "What if the setup process fails?",
      a: "Check your app permissions and try again. If it continues to fail, ensure you have the necessary permissions to create data fields in your Shopify store. You may need store owner or staff permissions."
    }
  ];

  const adminBlockFAQs = [
    {
      q: "Where do I manage MAP settings for my products?",
      a: "The product management tool appears on product detail pages in your Shopify admin sidebar. The variant management tool appears on individual variant detail pages."
    },
    {
      q: "Why don't I see any MAP data in the admin tools?",
      a: "This usually means the initial setup hasn't been completed yet. Go to the Setup page and create the required data fields first."
    },
    {
      q: "Can I manage multiple variants at once?",
      a: "Yes! The product management tool shows all variants in a table format where you can quickly edit MAP prices, toggle settings, and view compliance status for all variants."
    },
    {
      q: "What do the different status indicators mean?",
      a: (
        <div>
          <ul>
            <li><Badge tone="success">Active</Badge> - MAP is enabled and price is compliant</li>
            <li><Badge tone="critical">Violation</Badge> - Current price is below MAP price</li>
            <li><Badge tone="attention">Disabled</Badge> - MAP protection is turned off</li>
            <li><Badge>Not Set</Badge> - No MAP price has been configured</li>
          </ul>
        </div>
      )
    },
    {
      q: "How do I update MAP prices for many products at once?",
      a: "Currently, MAP Guard focuses on individual product and variant management through the admin tools. For bulk operations, you'll need to edit each product individually or use Shopify's bulk editor with the data fields."
    }
  ];

  const themeBlockFAQs = [
    {
      q: "How do I install the MAP Guard theme block?",
      a: "Go to Online Store → Themes → Customize, select Product pages, click 'Add block', and look for 'MAP Guard Message'. Place it near your product price area for best visibility."
    },
    {
      q: "The theme block isn't showing up in my theme editor. What's wrong?",
      a: "Make sure you've deployed the latest version of MAP Guard app. The theme block should appear in the block options. If not, try refreshing the theme editor or contact support."
    },
    {
      q: "Can I customize the appearance of the theme block?",
      a: "Yes! The theme block has extensive customization options including icon selection, colors, fonts, spacing, and styling. All settings are available in the theme editor."
    },
    {
      q: "Why isn't the price strike-through working?",
      a: "Ensure that 'Enable Price Strike-Through' is checked in the theme editor and that you have a MAP price set (either in metafields or the fallback setting). Check browser console for debugging information."
    },
    {
      q: "How does the message priority system work?",
      a: "Messages are selected in this order: 1) Custom variant metafield message, 2) Block default message from theme editor, 3) Hard-coded fallback message."
    },
    {
      q: "The strike-through is affecting the wrong price elements. Can I fix this?",
      a: "The theme block uses smart CSS selectors to detect price elements. If it's targeting the wrong elements, this might be due to unique theme structure. Contact support for theme-specific assistance."
    },
    {
      q: "Can I show different messages for different products?",
      a: "Yes! Set custom messages using the variant admin block, which stores them in metafields. Each variant can have its own custom message that overrides the default."
    }
  ];

  const troubleshootingFAQs = [
    {
      q: "The MAP Guard tools aren't showing up. What should I check?",
      a: (
        <div>
          <p>Try these troubleshooting steps:</p>
          <ol>
            <li>Ensure initial setup is completed (Setup page)</li>
            <li>Check that the latest app version is deployed</li>
            <li>Refresh your browser and clear cache</li>
            <li>Verify the app is properly installed and permissions are granted</li>
          </ol>
        </div>
      )
    },
    {
      q: "I'm getting errors during setup. How do I fix this?",
      a: "This usually indicates a permissions issue. Ensure your Shopify user account has the necessary permissions to create data fields. You may need store owner or staff permissions."
    },
    {
      q: "The storefront display is showing but not working correctly. What's wrong?",
      a: "Check the browser console for error messages. Common issues include incomplete setup, incorrect MAP price configuration, or theme compatibility. Enable the fallback MAP price for testing."
    },
    {
      q: "How do I reset MAP Guard if something goes wrong?",
      a: "You can delete the data fields from the Setup page to reset everything, then recreate them. For storefront displays, you can remove and re-add them in the theme editor."
    },
    {
      q: "Who can I contact for additional support?",
      a: "For technical support or theme-specific assistance, contact our support team through the Shopify App Store or use the support channels provided in your MAP Guard app dashboard."
    }
  ];

  return (
    <Page>
      <TitleBar title="Frequently Asked Questions" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner title="Need Help?" tone="info">
              <p>
                Find answers to common questions about MAP Guard setup, configuration, and troubleshooting. 
                If you can't find what you're looking for, check the Setup page for detailed configuration guides.
              </p>
            </Banner>

            <FAQSection 
              id="general"
              title="Getting Started with MAP Guard"
              questions={generalFAQs}
              mainQuestions={3}
            />

            <FAQSection 
              id="metafields"
              title="Initial Setup & Configuration"
              questions={setupFAQs}
              mainQuestions={2}
            />

            <FAQSection 
              id="admin-blocks"
              title="Managing Products & Variants"
              questions={adminBlockFAQs}
              mainQuestions={3}
            />

            <FAQSection 
              id="theme-block"
              title="Storefront Display & Customization"
              questions={themeBlockFAQs}
              mainQuestions={3}
            />

            <FAQSection 
              id="troubleshooting"
              title="Common Issues & Solutions"
              questions={troubleshootingFAQs}
              mainQuestions={2}
            />

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Still Need Help?
                </Text>
                <Text variant="bodyMd" as="p">
                  If you couldn't find the answer to your question, here are additional resources:
                </Text>
                <ul>
                  <li><strong>Setup Guide:</strong> Visit the Setup page for comprehensive configuration instructions</li>
                  <li><strong>Documentation:</strong> Check the detailed setup sections for each component</li>
                  <li><strong>Support:</strong> Contact our technical support team for personalized assistance</li>
                  <li><strong>Theme Compatibility:</strong> Reach out if you're experiencing issues with a specific theme</li>
                </ul>
                <Banner tone="success">
                  <p>
                    <strong>Pro Tip:</strong> Most issues can be resolved by ensuring metafield definitions are created 
                    and the latest app version is deployed. Start with the Setup page if you're experiencing problems.
                  </p>
                </Banner>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
