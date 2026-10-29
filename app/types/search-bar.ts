export type PlanTier = "FREE" | "PRO" | "ADVANCED";

export interface TemplateDefinition {
  id: string;
  name: string;
  tier: PlanTier;
  number: number;
  description: string;
  defaultSettings: SearchBarSettings;
  features: string[];
}

export interface SearchBarSettings {
  // Common Settings (Free)
  placeholder: string;
  showIcon: boolean;
  iconPosition: "left" | "right";
  showButton: boolean;
  buttonText: string;
  maxWidth: number; // in px or percentage
  widthUnit: "%" | "px";

  // Pro Settings (Pro & Advanced)
  backgroundColor: string;
  textColor: string;
  placeholderColor: string;
  iconColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  height: number;
  fontSize: number;
  fontWeight: "normal" | "500" | "600" | "700";
  boxShadow: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonBorderRadius: number;

  // Advanced Settings (Advanced Only)
  imageUrl?: string;
  imagePlacement?: "left" | "right" | "background";
  imageWidth?: number;
  imageHeight?: number;
  imageFit?: "cover" | "contain" | "fill";
  imageBorderRadius?: number;
  bgOverlayColor?: string;
  bgOverlayOpacity?: number;
  gradientBg?: string;
  enableGradient?: boolean;
  predictiveThumbnails?: boolean;
  predictivePrices?: boolean;

  // Separate Mobile Controls (Advanced Only)
  mobileHeight?: number;
  mobileFontSize?: number;
  mobileBorderRadius?: number;
  mobileMaxWidth?: number;
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  price: number;
  currency: string;
  templatesAllowed: string[]; // template IDs
  maxConfigurations: number;
  features: string[];
  restrictions: string[];
}

