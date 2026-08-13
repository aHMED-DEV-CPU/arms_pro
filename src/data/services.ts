export type Service = {
  slug: string;
  title: string;
  shortDescription: string;
  imageFolder: string;
  fullDescription: string;
  overview?: string;
  details?: string[];
  capabilitiesTitle?: string;
  capabilities?: string[];
  benefitsTitle?: string;
  benefits?: {
    title: string;
    text: string;
  }[];
};

export const services: Service[] = [
  {
    slug: "light-gauge-steel",
    title: "Light Gauge Steel Systems",
    imageFolder: "Light Gauge Steel",
    shortDescription:
      "Lightweight steel construction systems offering precise, adaptable structural solutions for modern building requirements.",
    fullDescription:
      "ARMS PRO provides Light Gauge Steel solutions as part of its wider steel and construction capabilities. LGS uses engineered lightweight steel framing to create organized structural systems that can support a range of architectural and building applications.",
    overview:
      "ARMS PRO provides Light Gauge Steel solutions as part of its wider steel and construction capabilities. LGS uses engineered lightweight steel framing to create organized structural systems that can support a range of architectural and building applications.",
    details: [
      "The system is based on accurately arranged steel framing components that form walls, floors and roof structures according to the requirements of the building design. Its modular and organized nature makes it well suited to projects where construction precision and flexibility are important.",
      "Light Gauge Steel can work effectively with modern architectural concepts because the structural framework can be coordinated with internal layouts, facade systems and finishing requirements from an early stage of the project.",
      "Within ARMS PRO's broader capabilities, LGS sits alongside conventional steel structures, architectural design, construction and finishing, allowing the structural approach to be considered as part of the complete project rather than as an isolated system.",
    ],
    capabilitiesTitle: "Suitable Applications",
    capabilities: [
      "Residential structures",
      "Modern villa construction",
      "Building extensions and annexes",
      "Light commercial structures",
      "Modular and specialized buildings",
      "Projects requiring lightweight steel framing",
    ],
    benefitsTitle: "Why Light Gauge Steel?",
    benefits: [
      {
        title: "Structural Precision",
        text: "Organized steel framing supports accurate coordination of structural components.",
      },
      {
        title: "Lightweight Construction",
        text: "LGS provides a lighter structural approach than many conventional heavy structural systems.",
      },
      {
        title: "Design Flexibility",
        text: "The framing system can support a variety of layouts and architectural configurations.",
      },
      {
        title: "Efficient Coordination",
        text: "Structural framing can be coordinated early with architecture, facades and interior requirements.",
      },
      {
        title: "Adaptable Applications",
        text: "The system can support residential, commercial and specialized building requirements.",
      },
    ],
  },
  {
    slug: "building-designs",
    title: "Building & Architectural Design",
    imageFolder: "building designs",
    shortDescription:
      "Architectural design solutions shaped around function, proportion, identity and practical project execution.",
    fullDescription:
      "ARMS PRO develops architectural solutions that connect design intent with real project requirements. The objective is not only to create a strong visual concept, but to organize spaces, materials and architectural elements in a way that remains functional and practical to execute.",
    overview:
      "ARMS PRO develops architectural solutions that connect design intent with real project requirements. The objective is not only to create a strong visual concept, but to organize spaces, materials and architectural elements in a way that remains functional and practical to execute.",
    details: [
      "The design process considers the relationship between exterior architecture, internal spaces, circulation, proportions, materials and the overall identity of the project. This helps create a consistent architectural language instead of treating each element independently.",
      "ARMS PRO's wider construction and finishing capabilities also allow architectural ideas to be considered with execution in mind. This connection between concept and implementation supports more practical decisions during design development and helps maintain the intended character of the project through later stages.",
      "The service can support residential and commercial projects, including architectural concepts, exterior treatments, internal planning and the development of visual directions suited to the function and character of each project.",
    ],
    capabilitiesTitle: "Design Capabilities",
    capabilities: [
      "Architectural concepts",
      "Exterior design",
      "Space planning",
      "Interior design coordination",
      "Material and finish direction",
      "Residential design",
      "Commercial design",
      "Design development toward execution",
    ],
    benefitsTitle: "Our Design Approach",
    benefits: [
      {
        title: "Function First",
        text: "Spaces are planned around how the building will actually be used.",
      },
      {
        title: "Clear Architectural Identity",
        text: "Forms, materials and details are developed as part of one consistent design direction.",
      },
      {
        title: "Design with Execution in Mind",
        text: "Architectural decisions are considered alongside practical construction and finishing requirements.",
      },
      {
        title: "Integrated Thinking",
        text: "Exterior architecture, interiors, finishes and project requirements are considered together rather than as isolated elements.",
      },
    ],
  },
  {
    slug: "foam-stone",
    title: "Foam Stone & Architectural Facades",
    imageFolder: "foam-stone",
    shortDescription:
      "Lightweight architectural facade and decorative solutions that provide flexible detailing for exterior and architectural applications.",
    fullDescription:
      "ARMS PRO provides Foam Stone and architectural facade solutions for projects that require detailed exterior character without relying only on traditional heavy decorative materials. The system allows a wide variety of profiles and architectural elements to be incorporated into facade designs.",
    overview:
      "ARMS PRO provides Foam Stone and architectural facade solutions for projects that require detailed exterior character without relying only on traditional heavy decorative materials. The system allows a wide variety of profiles and architectural elements to be incorporated into facade designs.",
    details: [
      "Foam Stone can be formed into different architectural profiles and decorative components, allowing designers to create facade details around windows, doors, corners, columns and roof lines while maintaining a coordinated architectural appearance.",
      "Its lightweight nature makes the system practical for a variety of facade applications and can simplify handling and installation compared with heavier decorative alternatives. The material also supports different architectural styles, allowing the same system to be adapted to modern, classical or customized facade concepts.",
      "The available architectural range can support both broad facade surfaces and detailed finishing pieces, allowing designers to combine functional facade treatment with decorative definition.",
    ],
    capabilitiesTitle: "Architectural Applications",
    capabilities: [
      "Facade panels and cladding elements",
      "Window and door frames",
      "Window crowns and decorative surrounds",
      "Window bases and sills",
      "Corners and edge details",
      "Cornices",
      "Columns and column details",
      "Column crowns",
      "Decorative architectural elements",
    ],
    benefitsTitle: "Key Advantages",
    benefits: [
      {
        title: "Lightweight",
        text: "The low-weight nature of the system can simplify handling and facade installation.",
      },
      {
        title: "Design Flexibility",
        text: "A wide range of profiles and decorative forms can be developed for different architectural styles.",
      },
      {
        title: "Efficient Installation",
        text: "Lightweight prefabricated architectural elements can support a more practical installation process.",
      },
      {
        title: "Facade Detailing",
        text: "The system makes it possible to add depth, frames, cornices, columns and other visual features to a facade.",
      },
      {
        title: "Insulation Support",
        text: "Foam-based facade elements can contribute useful thermal and acoustic properties as part of an appropriate facade system.",
      },
    ],
  },
  {
    slug: "modern-villa-architecture",
    title: "Modern Villa Architecture",
    imageFolder: "Modern Villa Architecture",
    shortDescription:
      "Modern villa concepts that balance clean architectural forms with practical living spaces.",
    fullDescription:
      "Modern villa concepts that balance clean architectural forms with practical living spaces.",
  },
  {
    slug: "building",
    title: "General Contracting & Construction",
    imageFolder: "building",
    shortDescription:
      "Integrated construction solutions delivered with precise planning, quality execution and attention to every stage of the project.",
    fullDescription:
      "Integrated construction solutions delivered with precise planning, quality execution and attention to every stage of the project.",
  },
  {
    slug: "modular-cabins-mobile-units",
    title: "Modular Cabins & Mobile Units",
    imageFolder: "Modular Cabins & Mobile Units",
    shortDescription:
      "Flexible modular cabins and mobile units designed for practical, comfortable and adaptable use across commercial, hospitality, residential and site applications.",
    fullDescription:
      "ARMS PRO provides modular cabins and mobile units that combine efficient construction with flexible space planning and practical mobility. These units can support a wide range of requirements, from site offices and temporary facilities to hospitality spaces, accommodation and commercial uses.",
    overview:
      "ARMS PRO provides modular cabins and mobile units that combine efficient construction with flexible space planning and practical mobility. These units can support a wide range of requirements, from site offices and temporary facilities to hospitality spaces, accommodation and commercial uses.",
    details: [
      "Modular construction allows much of the unit to be prepared in a controlled environment before being transported and positioned at its destination. This approach can simplify site work and provides a practical alternative where conventional permanent construction may not be the most suitable solution.",
      "Layouts, internal arrangements, finishes and exterior treatments can be adapted according to the intended function of the unit. The same modular concept can therefore support very different applications while maintaining an efficient and organized construction approach.",
      "ARMS PRO approaches these units as complete usable spaces rather than simple temporary structures, with attention to functionality, internal comfort, architectural appearance and integration with the requirements of the site.",
    ],
    capabilitiesTitle: "Possible Applications",
    capabilities: [
      "Site offices and project facilities",
      "Portable offices and workspaces",
      "Hospitality and guest units",
      "Temporary accommodation",
      "Commercial spaces",
      "Support and service units",
    ],
    benefitsTitle: "Why Modular?",
    benefits: [
      {
        title: "Flexible Design",
        text: "Layouts and finishes can be adapted around the intended use of the unit.",
      },
      {
        title: "Efficient Delivery",
        text: "Off-site preparation can reduce the amount of construction activity required at the final location.",
      },
      {
        title: "Mobility",
        text: "Portable solutions can be suitable for projects where relocation or changing site requirements are important.",
      },
      {
        title: "Multiple Uses",
        text: "The same construction concept can support offices, accommodation, hospitality, commercial and support functions.",
      },
    ],
  },
  {
    slug: "site-progress-construction",
    title: "Construction & Site Execution",
    imageFolder: "Site Progress & Construction",
    shortDescription:
      "Coordinated site execution focused on translating project requirements into organized, practical and quality-controlled construction work.",
    fullDescription:
      "ARMS PRO supports construction and site execution through coordinated project activities that connect approved design intentions with the physical work carried out on site. The focus is on organized execution, construction quality and coordination between the different disciplines involved in the project.",
    overview:
      "ARMS PRO supports construction and site execution through coordinated project activities that connect approved design intentions with the physical work carried out on site. The focus is on organized execution, construction quality and coordination between the different disciplines involved in the project.",
    details: [
      "Site execution requires more than completing individual construction tasks. Architectural work, structural requirements, services and finishing activities must be coordinated in the correct sequence so that each stage supports the work that follows.",
      "ARMS PRO's multidisciplinary capabilities allow construction, structural work and fit-out requirements to be considered as connected parts of the same project. This is particularly useful where a project combines structural systems, building services and detailed finishing within one delivery scope.",
      "The execution process also requires continuous attention to site conditions, workmanship, materials and progress so that the built result remains aligned with the intended design and project requirements.",
    ],
    capabilitiesTitle: "Execution Focus",
    capabilities: [
      "Site construction activities",
      "Coordination between project disciplines",
      "Structural work coordination",
      "Architectural execution",
      "Preparation for finishing stages",
      "Fit-out coordination",
      "Progress and workmanship follow-up",
    ],
    benefitsTitle: "Execution Advantages",
    benefits: [
      {
        title: "Coordinated Work",
        text: "Construction stages are considered as connected activities rather than isolated trades.",
      },
      {
        title: "Design-to-Site Continuity",
        text: "Execution remains focused on translating the intended project design into the built result.",
      },
      {
        title: "Practical Sequencing",
        text: "Work is organized around the relationship between structural, architectural and finishing requirements.",
      },
      {
        title: "Attention to Detail",
        text: "Site execution considers both major construction activities and the details that influence final quality.",
      },
    ],
  },
  {
    slug: "our-work-from-inside",
    title: "Interior Fit-Out & Finishing",
    imageFolder: "our work from inside",
    shortDescription:
      "Integrated interior fit-out and finishing solutions focused on quality, functionality, material coordination and the identity of each space.",
    fullDescription:
      "ARMS PRO delivers interior fit-out and finishing solutions for commercial, hospitality and residential spaces, connecting design intent with the practical work required to complete the interior environment.",
    overview:
      "ARMS PRO delivers interior fit-out and finishing solutions for commercial, hospitality and residential spaces, connecting design intent with the practical work required to complete the interior environment.",
    details: [
      "The service covers the coordination of interior elements that shape the final experience of a space, including finishes, ceilings, wall treatments, flooring, lighting-related detailing and custom interior elements where required.",
      "For commercial environments such as restaurants, cafes, showrooms and branded spaces, the objective is not simply to finish the building, but to translate the identity of the project into materials, details and a coherent customer-facing environment.",
      "ARMS PRO's capabilities also include custom furniture, kitchens and cabinetry, allowing fixed and movable interior elements to be considered as part of the wider fit-out rather than as disconnected additions.",
    ],
    capabilitiesTitle: "Fit-Out Capabilities",
    capabilities: [
      "Interior finishing",
      "Commercial fit-out",
      "Hospitality interiors",
      "Wall and ceiling treatments",
      "Flooring coordination",
      "Lighting-related interior detailing",
      "Custom furniture",
      "Kitchen and cabinetry works",
      "Interior finishing coordination",
    ],
    benefitsTitle: "Why Integrated Fit-Out?",
    benefits: [
      {
        title: "Consistent Finish",
        text: "Materials and details are coordinated to create a unified interior result.",
      },
      {
        title: "Design Continuity",
        text: "The original interior concept can be carried through into physical finishes and details.",
      },
      {
        title: "Custom Solutions",
        text: "Furniture, cabinetry and selected interior elements can be adapted around project requirements.",
      },
      {
        title: "Commercial Identity",
        text: "Fit-out decisions can support the character and brand identity of customer-facing spaces.",
      },
    ],
  },
  {
    slug: "khema",
    title: "Event Tents & Outdoor Structures",
    imageFolder: "Khema",
    shortDescription:
      "Outdoor structure solutions for event, hospitality and temporary-use environments.",
    fullDescription:
      "Outdoor structure solutions for event, hospitality and temporary-use environments.",
  },
];

export const featuredServiceSlugs = [
  "light-gauge-steel",
  "building-designs",
  "foam-stone",
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
