import * as React from "react";
import {
  Tailwind,
  Section,
  Text,
  Container,
  Heading,
  Hr,
  Link,
} from "@react-email/components";

export type WelcomeEmailProps = {
  name?: string;
  appName?: string;
};

export const WelcomeEmail = ({
  name = "there",
  appName = "Elysia Kit",
}: WelcomeEmailProps) => {
  return (
    <Tailwind
      children={
        <Container className="bg-white font-sans">
          <Section
            className="px-8 py-12 text-center"
            style={{
              backgroundColor: "#7c3aed",
              background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
            }}
          >
            <Heading
              className="text-white text-3xl font-bold m-0 mb-4"
              style={{
                color: "#ffffff",
                fontSize: "32px",
                fontWeight: "700",
                margin: "0 0 16px 0",
                lineHeight: "1.2",
              }}
            >
              Welcome to {appName}! 🎉
            </Heading>
            <Text
              className="text-white text-lg m-0"
              style={{
                color: "#f3e8ff",
                fontSize: "18px",
                fontWeight: "600",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              We're thrilled to have you on board
            </Text>
          </Section>

          <Section className="px-8 py-8">
            <Text className="text-gray-700 text-base leading-relaxed mb-6">
              Hi {name},
            </Text>

            <Text className="text-gray-700 text-base leading-relaxed mb-6">
              Thank you for joining {appName}! We're excited to have you as part
              of our community. You're now all set to explore everything we have
              to offer.
            </Text>

            <Text className="text-gray-700 text-base leading-relaxed mb-6">
              Here's what you can do next:
            </Text>

            <Section className="bg-gray-50 rounded-lg p-6 mb-6">
              <Text className="text-gray-800 text-sm font-semibold mb-2 m-0">
                ✨ Get Started
              </Text>
              <Text className="text-gray-600 text-sm m-0 mb-3">
                Explore our features and discover what makes {appName} special
              </Text>

              <Text className="text-gray-800 text-sm font-semibold mb-2 m-0">
                📚 Learn More
              </Text>
              <Text className="text-gray-600 text-sm m-0 mb-3">
                Check out our documentation and guides to make the most of your
                experience
              </Text>

              <Text className="text-gray-800 text-sm font-semibold mb-2 m-0">
                💬 Connect
              </Text>
              <Text className="text-gray-600 text-sm m-0">
                Reach out if you have any questions or feedback - we're here to
                help!
              </Text>
            </Section>

            <Section className="text-center mb-6">
              <Link
                href="#"
                className="bg-violet-600 text-white px-6 py-3 rounded-lg text-base font-semibold no-underline inline-block"
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Get Started
              </Link>
            </Section>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-gray-500 text-sm text-center m-0">
              If you have any questions, feel free to reach out to our support
              team. We're always happy to help!
            </Text>

            <Text className="text-gray-500 text-sm text-center mt-4 m-0">
              Welcome aboard,
            </Text>
            <Text className="text-gray-500 text-sm text-center m-0">
              The {appName} Team
            </Text>
          </Section>

          <Section className="bg-gray-50 px-8 py-6 text-center">
            <Text className="text-gray-500 text-xs m-0">
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      }
    />
  );
};
