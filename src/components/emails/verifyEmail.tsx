import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";

interface VerifyIdentityEmailProps {
  validationCode: string;
  expiryMinutes?: number;
  locale: "en" | "fr" | "es" | "pt";
}

// =========================
// Localization Block
// =========================
const M = {
  en: {
    title: "Verify Your Identity",
    subtitle: "Enter the following code to verify your email.",
    expires: (m: number) => `Code expires in ${m} minutes.`,
    notExpected: "Not expecting this email?",
    contact: "Contact",
    footer: "Securely powered by",
  },
  fr: {
    title: "Vérifiez votre identité",
    subtitle: "Entrez le code ci-dessous pour vérifier votre adresse e-mail.",
    expires: (m: number) => `Le code expire dans ${m} minutes.`,
    notExpected: "Vous n'attendiez pas cet e-mail ?",
    contact: "Contactez",
    footer: "Sécurisé par",
  },
  es: {
    title: "Verifica tu identidad",
    subtitle: "Ingresa el siguiente código para verificar tu correo.",
    expires: (m: number) => `El código expira en ${m} minutos.`,
    notExpected: "¿No esperabas este correo?",
    contact: "Contacta a",
    footer: "Protegido de forma segura por",
  },
  pt: {
    title: "Verifique sua identidade",
    subtitle: "Insira o código abaixo para verificar seu e-mail.",
    expires: (m: number) => `O código expira em ${m} minutos.`,
    notExpected: "Não esperava este e-mail?",
    contact: "Contato",
    footer: "Protegido com segurança por",
  },
};

export const VerifyEmail = ({
  validationCode,
  expiryMinutes = 30,
  locale = "en",
}: VerifyIdentityEmailProps) => {
  const t = M[locale] ?? M.en; // fallback safely

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Link href="https://xcorthub.com" style={header}>
            <span style={span}>X</span>cort<span style={span}>H</span>ub
          </Link>

          <Heading style={secondary}>{t.title}</Heading>

          <Text style={tertiary}>{t.subtitle}</Text>

          <Section style={codeContainer}>
            <Text style={code}>{validationCode}</Text>
          </Section>

          <Text style={{ fontSize: 14, color: "#94a3b8", textAlign: "center" }}>
            {t.expires(expiryMinutes)}
          </Text>

          <Text style={paragraph}>{t.notExpected}</Text>

          <Text style={paragraph}>
            {t.contact}{" "}
            <Link href="mailto:admin@xcorthub.com" style={link}>
              xcorthub.com
            </Link>{" "}
            {locale === "fr"
              ? "si vous n'avez pas demandé ce code."
              : locale === "es"
                ? "si no solicitaste este código."
                : locale === "pt"
                  ? "se você não solicitou este código."
                  : "if you did not request this code."}
          </Text>
        </Container>

        <Text style={footer}>
          {t.footer} <span style={span}>X</span>cort
          <span style={span}>H</span>ub.
        </Text>
      </Body>
    </Html>
  );
};

VerifyEmail.PreviewProps = {
  validationCode: "144833",
  expiryMinutes: 20,
  locale: "en",
} as VerifyIdentityEmailProps;

export default VerifyEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const header = {
  display: "block",
  textAlign: "center" as const,
  fontWeight: 700,
  fontSize: "24px",
  color: "#000",
  width: "100%",
};

const span = {
  color: "gold",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px #14324633",
  marginTop: "20px",
  maxWidth: "360px",
  margin: "0 auto",
  padding: "68px 0 130px",
};

const tertiary = {
  fontSize: "16px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  letterSpacing: "0",
  lineHeight: "16px",
  margin: "16px 8px 8px 8px",
  textAlign: "center" as const,
};

const secondary = {
  color: "#000",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "24px",
  marginBottom: "0",
  marginTop: "13px",
  textAlign: "center" as const,
};

const codeContainer = {
  background: "#0000000d",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};

const code = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Bold",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  width: "100%",
  padding: "0 5px",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#444",
  fontSize: "15px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  letterSpacing: "0",
  lineHeight: "23px",
  padding: "0 40px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#444",
  textDecoration: "underline",
};

const footer = {
  color: "#000",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0",
  lineHeight: "23px",
  margin: "0",
  marginTop: "20px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  textAlign: "center" as const,
};
