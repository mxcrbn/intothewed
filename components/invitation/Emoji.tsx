/* eslint-disable @next/next/no-img-element */
// The hand-drawn emojis used in the text (art/emojis, imported by tools/import_emojis.py): drawn in the
// house's charcoal line, in place of the colour emojis, which would clash with the pencil drawing.
// They only decorate the words next to them, so screen readers skip them.
const EMOJIS = { "heart-hands": "🫶", hugging: "🤗" } as const;

export default function Emoji({ name }: { name: keyof typeof EMOJIS }) {
  return <img className={`emoji emoji--${name}`} src={`/assets/emoji/${name}.png`} width={128} height={128} alt="" />;
}
