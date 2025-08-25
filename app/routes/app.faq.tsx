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
import { useI18n } from "../hooks/useI18n";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export default function FAQPage() {
  const { t } = useI18n();
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
    questions: { question: string; answer: string | JSX.Element }[];
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
                {openSections[id] ? t('app.general.show_less') : `${t('app.general.show_more')} (${additionalQs.length})`}
              </Button>
            )}
          </InlineStack>

          <BlockStack gap="300">
            {/* Always show main questions */}
            {mainQs.map((faq, index) => (
              <div key={index}>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3" tone="subdued">
                    Q: {faq.question}
                  </Text>
                  <div style={{ color: 'var(--p-color-text)' }}>
                    <strong>A:</strong> {faq.answer}
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
                        Q: {faq.question}
                      </Text>
                      <div style={{ color: 'var(--p-color-text)' }}>
                        <strong>A:</strong> {faq.answer}
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

  // Create FAQ sections with individual translations - dynamic question loading
  const getSectionQuestions = (sectionKey: string, maxQuestions: number = 10) => {
    const questions = [];
    for (let i = 0; i < maxQuestions; i++) {
      const questionKey = `faq.sections.${sectionKey}.questions.${i}.question`;
      const answerKey = `faq.sections.${sectionKey}.questions.${i}.answer`;
      
      const question = t(questionKey);
      const answer = t(answerKey);
      
      // Stop if we get back the key itself (meaning translation doesn't exist)
      if (question === questionKey || answer === answerKey) {
        break;
      }
      
      questions.push({ question, answer });
    }
    return questions;
  };

  const faqSections = [
    {
      id: 'getting_started',
      title: t('faq.sections.getting_started.title'),
      questions: getSectionQuestions('getting_started')
    },
    {
      id: 'setup',
      title: t('faq.sections.setup.title'),
      questions: getSectionQuestions('setup')
    },
    {
      id: 'billing',
      title: t('faq.sections.billing.title'),
      questions: getSectionQuestions('billing')
    },
    {
      id: 'troubleshooting',
      title: t('faq.sections.troubleshooting.title'),
      questions: getSectionQuestions('troubleshooting')
    }
  ];

  return (
    <Page>
      <TitleBar title={t('faq.title')} />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner title={t('faq.banner.title')} tone="info">
              <p>
                {t('faq.banner.description')}
              </p>
            </Banner>

            {faqSections.map((section, index) => (
              <FAQSection 
                key={section.id}
                id={section.id}
                title={section.title}
                questions={section.questions}
                mainQuestions={index === 0 ? 3 : 2}
              />
            ))}

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  {t('faq.contact.title')}
                </Text>
                <Text variant="bodyMd" as="p">
                  {t('faq.contact.description')}
                </Text>
                <Button variant="primary">
                  {t('faq.contact.action')}
                </Button>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
