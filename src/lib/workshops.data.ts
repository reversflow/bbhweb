import { PenLine, Mic2, Sparkles, Compass, type LucideIcon } from "lucide-react";

export type Workshop = {
  slug: string;
  icon: LucideIcon;
  title: string;
  text: string;
  /** Longer editorial description used on the detail page. */
  detail: string;
  audience: string;
  duration: string;
  slot: string;
};

export const WORKSHOPS: Workshop[] = [
  {
    slug: "atelier-ecriture-rap",
    icon: PenLine,
    title: "Atelier écriture rap",
    text: "Apprendre à transformer une idée, une émotion ou une histoire en texte, couplet, refrain ou performance.",
    detail:
      "Un atelier d'écriture pensé comme un espace d'expression : trouver son sujet, structurer un couplet, travailler les rimes, le flow et la présence. Chaque participant repart avec un texte abouti et des outils concrets pour continuer seul.",
    audience: "Écoles, MJC, centres sociaux, jeunes artistes",
    duration: "2h à 3h par séance",
    slot: "workshops_hero",
  },
  {
    slug: "initiation-enregistrement",
    icon: Mic2,
    title: "Initiation à l'enregistrement",
    text: "Découvrir les bases du studio, du micro, de la prise de voix et de la création d'un morceau.",
    detail:
      "Découverte du studio : matériel, placement micro, prise de voix, écoute critique et bases du mixage. L'atelier se termine par l'enregistrement d'une prise réelle, que le groupe écoute et commente ensemble.",
    audience: "Structures culturelles, associations, jeunes artistes",
    duration: "3h à une journée",
    slot: "workshops_hero",
  },
  {
    slug: "expression-artistique",
    icon: Sparkles,
    title: "Expression artistique",
    text: "Créer un espace où chacun peut prendre confiance, écrire, parler, performer et développer sa voix.",
    detail:
      "Un temps centré sur la confiance : prise de parole, gestion du trac, présence scénique et respect de la parole de l'autre. L'objectif est moins la performance que la capacité à s'exprimer devant un groupe.",
    audience: "Écoles, MJC, centres sociaux, mairies",
    duration: "2h par séance",
    slot: "workshops_hero",
  },
  {
    slug: "accompagnement-artistes",
    icon: Compass,
    title: "Accompagnement artistes",
    text: "Conseils sur l'identité artistique, la préparation live, les sorties musicales et la construction d'un projet.",
    detail:
      "Un accompagnement individuel ou en petit groupe : clarifier son identité artistique, préparer un live, planifier une sortie, structurer un projet sur plusieurs mois. Basé sur l'expérience réelle du collectif BBH.",
    audience: "Artistes indépendants, projets émergents",
    duration: "Cycle sur plusieurs séances",
    slot: "workshops_hero",
  },
];

export function findWorkshop(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug);
}
