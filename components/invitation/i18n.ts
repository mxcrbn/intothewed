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

// The RSVP form.
export const RSVP_TEXT: Record<Lang, {
  title: string; name: string; attending: string; yes: string; no: string; people: string;
  children: string; others: string; dietary: string; email: string; note: string; optional: string;
  send: string; sending: string; thanksYes: string; thanksNo: string; error: string; close: string;
}> = {
  en: {
    title: "Will you join us?",
    name: "Your name",
    attending: "Will you be there?",
    yes: "Yes, with joy",
    no: "Sadly, no",
    people: "How many of you, including you?",
    children: "Children among them",
    others: "Names of the others",
    dietary: "Allergies or diet (vegetarian…)",
    email: "Your email",
    note: "A note for us",
    optional: "optional",
    send: "Send",
    sending: "Sending…",
    thanksYes: "Thank you! We can’t wait to celebrate with you.",
    thanksNo: "Thank you for letting us know. You’ll be missed!",
    error: "Something went wrong. Please try again in a moment.",
    close: "Close",
  },
  hu: {
    title: "Velünk ünnepelsz?",
    name: "Neved",
    attending: "Ott leszel?",
    yes: "Igen, örömmel",
    no: "Sajnos nem",
    people: "Hányan lesztek, veled együtt?",
    children: "Ebből gyerek",
    others: "A többiek neve",
    dietary: "Ételallergia vagy étrend (vegetáriánus…)",
    email: "E-mail címed",
    note: "Üzenet nekünk",
    optional: "nem kötelező",
    send: "Küldés",
    sending: "Küldés…",
    thanksYes: "Köszönjük! Alig várjuk, hogy együtt ünnepeljünk.",
    thanksNo: "Köszönjük, hogy szóltál. Hiányozni fogsz!",
    error: "Valami hiba történt. Kérjük, próbáld újra egy kicsit később.",
    close: "Bezárás",
  },
  fr: {
    title: "Serez-vous des nôtres ?",
    name: "Votre nom",
    attending: "Serez-vous là ?",
    yes: "Oui, avec joie",
    no: "Hélas, non",
    people: "Combien serez-vous, vous compris ?",
    children: "Dont enfants",
    others: "Noms des autres personnes",
    dietary: "Allergies ou régime (végétarien…)",
    email: "Votre e-mail",
    note: "Un mot pour nous",
    optional: "facultatif",
    send: "Envoyer",
    sending: "Envoi…",
    thanksYes: "Merci ! Nous avons hâte de fêter ça avec vous.",
    thanksNo: "Merci de nous avoir prévenus. Vous nous manquerez !",
    error: "Une erreur s’est produite. Merci de réessayer dans un instant.",
    close: "Fermer",
  },
};
