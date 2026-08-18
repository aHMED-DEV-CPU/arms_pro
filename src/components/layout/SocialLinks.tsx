import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faLinkedinIn,
  faXTwitter,
  faFacebookF,
  faYoutube,
  faWhatsapp,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";

export function SocialLinks({
  socialLinks,
  variant = "default",
}: {
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    x?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  variant?: "default" | "pill";
}) {
  if (!socialLinks) return null;

  // Normalization logic for WhatsApp link
  const getWhatsAppHref = (phone: string) => {
    let normalized = phone.trim();
    // Remove spaces, hyphens, parentheses, and leading "+"
    normalized = normalized
      .replace(/\+/g, "")
      .replace(/\s/g, "")
      .replace(/-/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "");

    // If starting with "05" (Saudi local format), convert to international "9665..."
    if (normalized.startsWith("05")) {
      normalized = "966" + normalized.substring(1);
    }

    return `https://wa.me/${normalized}`;
  };

  const links = [
    {
      key: "instagram",
      url: socialLinks.instagram,
      icon: faInstagram,
      label: "Instagram",
    },
    {
      key: "linkedin",
      url: socialLinks.linkedin,
      icon: faLinkedinIn,
      label: "LinkedIn",
    },
    {
      key: "x",
      url: socialLinks.x,
      icon: faXTwitter,
      label: "X",
    },
    {
      key: "facebook",
      url: socialLinks.facebook,
      icon: faFacebookF,
      label: "Facebook",
    },
    {
      key: "youtube",
      url: socialLinks.youtube,
      icon: faYoutube,
      label: "YouTube",
    },
    {
      key: "whatsapp",
      url: socialLinks.whatsapp,
      icon: faWhatsapp,
      label: "WhatsApp",
    },
    {
      key: "tiktok",
      url: socialLinks.tiktok,
      icon: faTiktok,
      label: "TikTok",
    },
  ];

  // Filter out empty or whitespace-only links
  const activeLinks = links.filter((link) => {
    if (!link.url) return false;
    return link.url.trim().length > 0;
  });

  if (activeLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {activeLinks.map((link) => {
        const href =
          link.key === "whatsapp"
            ? getWhatsAppHref(link.url!)
            : link.url!.trim();

        const classes =
          variant === "pill"
            ? "flex items-center justify-center w-10 h-10 rounded-xl bg-dark text-white hover:bg-accent hover:text-dark transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-accent"
            : "text-white/60 hover:text-accent transition duration-200 focus:outline-none focus:ring-1 focus:ring-accent rounded p-0.5";

        return (
          <a
            key={link.key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={classes}
          >
            <FontAwesomeIcon icon={link.icon} className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
