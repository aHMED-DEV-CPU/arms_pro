export type LocalizedString = {
  en: string;
  ar?: string;
};

export type Media = {
  url: string;
  publicId: string;
};

export interface IService {
  name: LocalizedString;
  slug: string;
  shortDescription: LocalizedString;
  overview: LocalizedString;
  details: LocalizedString[];
  capabilitiesTitle?: LocalizedString;
  capabilities?: LocalizedString[];
  benefitsTitle?: LocalizedString;
  benefits?: {
    title: LocalizedString;
    text: LocalizedString;
  }[];
  coverImage: Media;
  gallery: Media[];
  video?: Media;
  featured: boolean;
  status: "draft" | "published";
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProject {
  title: LocalizedString;
  slug: string;
  category: LocalizedString;
  shortDescription: LocalizedString;
  fullDescription: LocalizedString;
  coverImage: Media;
  gallery: Media[];
  video?: Media;
  featured: boolean;
  status: "completed" | "in-progress" | "upcoming" | "on-hold";
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPartner {
  name: string;
  logo: Media;
  websiteUrl?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICompanySettings {
  companyName: LocalizedString;
  about?: LocalizedString;
  aboutParagraphs?: LocalizedString[];
  phone: string;
  email?: string;
  founderEmail?: string;
  salesEmail?: string;
  contactEmail?: string;
  address: LocalizedString;
  commercialRegistration: string;
  unifiedEstablishmentNumber: string;
  vatNumber: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    x?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  logo?: Media;
  heroImage?: Media;
  aboutImage?: Media;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdmin {
  email: string;
  passwordHash: string;
  name?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
