import { computed } from "vue";
import advisorAminoQr from "@/assets/images/advisor-amino-qr.png";
import advisorMaterialQr from "@/assets/images/advisor-material-qr.png";
import { getText } from "@/utils/language";

const DEFAULT_DIRECTUS_URL = "/directus-api";
const DIRECTUS_URL = (process.env.VUE_APP_DIRECTUS_URL || DEFAULT_DIRECTUS_URL).replace(/\/$/, "");
const DIRECTUS_ASSET_URL = (process.env.VUE_APP_DIRECTUS_ASSET_URL || DIRECTUS_URL).replace(/\/$/, "");

const FALLBACK_ADVISORS = [
  {
    key: "aminoAcid",
    labelKey: "contact.advisors.aminoAcid",
    phone: "15268103254",
    qrCodeUrl: advisorAminoQr,
  },
  {
    key: "materials",
    labelKey: "contact.advisors.materials",
    phone: "15296523218",
    qrCodeUrl: advisorMaterialQr,
  },
];

const FALLBACK_FOOTER_ADVISOR_KEY = "aminoAcid";

function getConfiguredValue(key) {
  const value = getText(key);
  if (!value || value === key) return "";
  return String(value).trim();
}

function normalizeAssetUrl(value, fallbackUrl) {
  if (!value) return fallbackUrl;
  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/assets/")) return `${DIRECTUS_ASSET_URL}${value}`;
  if (value.startsWith("/")) return value;
  return `${DIRECTUS_ASSET_URL}/assets/${value}`;
}

export const contactAdvisors = computed(() => (
  FALLBACK_ADVISORS.map((advisor) => {
    const configKey = `contact.advisorConfig.${advisor.key}`;
    const phone = getConfiguredValue(`${configKey}.phone`) || advisor.phone;
    const qrCode = getConfiguredValue(`${configKey}.qrFileId`);

    return {
      ...advisor,
      phone,
      qrCodeUrl: normalizeAssetUrl(qrCode, advisor.qrCodeUrl),
    };
  })
));

export const footerAdvisor = computed(() => {
  const configuredKey = getConfiguredValue("contact.advisorConfig.footerAdvisor") || FALLBACK_FOOTER_ADVISOR_KEY;
  return contactAdvisors.value.find((advisor) => advisor.key === configuredKey) || contactAdvisors.value[0];
});
