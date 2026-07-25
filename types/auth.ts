export interface FeatureCardData {
  id: string;
  label: string;
  iconSrc: string;
  /** Tailwind position classes for placing the card around the building. */
  positionClassName: string;
  /** Animation timing offsets so each card floats independently. */
  floatDuration: number;
  floatDelay: number;
  floatDistance: number;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthMode = "login" | "signup";

export interface AuthIllustrationSide {
  /** Which side the glass auth card sits on; the illustration takes the other. */
  cardSide: "left" | "right";
}
