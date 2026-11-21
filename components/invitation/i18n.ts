// Everything the site says, in its three languages. English is the default.
export const LANGS = ["hu", "en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = { hu: "Magyar", en: "English", fr: "Français" };

export const TEXT: Record<Lang, {
  scene: string; scroll: string; place: string; date: string; rsvp: string;
  languages: string; soon: string;
}> = {
  en: {
    scene: "Drawing of the little house in the woods: an owl flies from tree to tree, a deer wanders into the garden, three children play, and Nóri & Max step out of the front door.",
    scroll: "Scroll down to the invitation",
    place: "Cegléd, Hungary",
    date: "August 2027",
    rsvp: "RSVP",
    languages: "Language",
    soon: "Our RSVP form is coming soon.",
  },
  hu: {
    scene: "A kis erdei ház rajza: egy bagoly fáról fára repül, egy őz besétál a kertbe, három gyerek játszik, Nóri és Max pedig kilépnek a bejárati ajtón.",
    scroll: "Görgess lefelé a meghívóhoz",
    place: "Cegléd, Magyarország",
    date: "2027. augusztus",
    rsvp: "Visszajelzés",
    languages: "Nyelv",
    soon: "A visszajelző űrlap hamarosan érkezik.",
  },
  fr: {
    scene: "Dessin de la petite maison dans les bois : une chouette vole d’arbre en arbre, une biche entre dans le jardin, trois enfants jouent, et Nóri & Max sortent sur le perron.",
    scroll: "Faites défiler jusqu’à l’invitation",
    place: "Cegléd, Hongrie",
    date: "Août 2027",
    rsvp: "Confirmer ma présence",
    languages: "Langue",
    soon: "Le formulaire de réponse arrive bientôt.",
  },
};
