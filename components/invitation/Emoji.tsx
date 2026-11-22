/* eslint-disable @next/next/no-img-element */
// The hand-drawn emojis used in the text (art/emojis, imported by tools/import_emojis.py): drawn in the
// house's charcoal line, in place of the colour emojis, which would clash with the pencil drawing.
// Each image is cropped to its drawing, so CSS sizes it on the text (.emoji--name in globals.css).
// They only decorate the words next to them, so screen readers skip them.
const EMOJIS = {
  "heart-hands": { emoji: "🫶", width: 222, height: 128 },
  hugging: { emoji: "🤗", width: 150, height: 128 },
} as const;

export type EmojiName = keyof typeof EMOJIS;

export default function Emoji({ name }: { name: EmojiName }) {
  const { width, height } = EMOJIS[name];
  return <img className={`emoji emoji--${name}`} src={`/assets/emoji/${name}.png`} width={width} height={height} alt="" />;
}

// A sentence ending with an emoji: the last word and the emoji stay together on one line.
export function WithEmoji({ text, name }: { text: string; name: EmojiName }) {
  const cut = text.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, cut)}
      <span className="nobreak">{text.slice(cut)}&nbsp;<Emoji name={name} /></span>
    </>
  );
}
