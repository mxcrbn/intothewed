"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { WithEmoji } from "./Emoji";
import { RSVP_TEXT, type Lang } from "./i18n";
import { RSVP_ENDPOINT } from "./rsvp-config";

type Status = "idle" | "sending" | "sent" | "error";
type Attending = "" | "yes" | "maybe" | "no";
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const TIMEOUT = 20000;   // ms: after that, sending gives up and says so (it never hangs)

// The RSVP form, on a full sheet of paper over the card. Answers go to the Google Apps Script
// (tools/rsvp/Code.gs), which adds a row to the RSVP sheet and emails Nóri & Max.
export default function RsvpDialog({ lang, open, onClose }: { lang: Lang; open: boolean; onClose: () => void }) {
  const t = RSVP_TEXT[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const thanks = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const [attending, setAttending] = useState<Attending>("");
  const [people, setPeople] = useState(1);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // showModal focuses the close button, which then shows its keyboard-focus outline (Safari does
      // even after a tap): start with the focus on the sheet itself; Tab still reaches the button
      d.focus();
    }
    if (!open && d.open) d.close();
  }, [open, mounted]);
  // once sent: back to the top of the sheet, and the thank-you is announced and takes the focus
  useEffect(() => {
    if (status !== "sent") return;
    dialog.current?.scrollTo(0, 0);
    thanks.current?.focus();
  }, [status]);

  // Closing after an answer was sent puts a fresh form back, for the next person on this device.
  function close() {
    if (status === "sent") { setStatus("idle"); setAttending(""); setPeople(1); }
    onClose();
  }

  // The browser's own validation bubbles are in the browser's language and type, not the page's:
  // instead, the fields still to fill in are marked by hand (see [aria-invalid] in globals.css) and
  // the first one takes the focus.
  function mark(el: Field) {
    if (el.checkValidity()) el.removeAttribute("aria-invalid");
    else el.setAttribute("aria-invalid", "true");
  }

  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fields = Array.from(form.elements) as Field[];
    fields.forEach(el => { if (el.willValidate) mark(el); });
    const first = fields.find(el => el.willValidate && !el.checkValidity());
    if (first) { first.focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), TIMEOUT);
    try {
      // a plain-text body keeps this a "simple" request: no CORS preflight, which Apps Script can't answer
      const res = await fetch(RSVP_ENDPOINT, { method: "POST", body: JSON.stringify({ ...data, lang }), signal: abort.signal });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error);
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }

  if (!mounted) return null;
  const sent = status === "sent";
  return createPortal(
    <dialog ref={dialog} className="rsvp-dialog" tabIndex={-1} onClose={close} aria-labelledby={sent ? undefined : "rsvp-title"}
            aria-label={sent ? t.close : undefined} lang={lang}>
      <button type="button" className="rsvp-dialog__close" onClick={close} aria-label={t.close}><span aria-hidden="true" /></button>
      <div className="rsvp-dialog__inner">
        <img className="rsvp-dialog__rings" src="/assets/rings/rings.png" width={768} height={480} alt="" loading="lazy" />

        {sent ? (
          <div className="rsvp-dialog__done">
            <p className="rsvp-dialog__thanks" role="status" tabIndex={-1} ref={thanks}>
              <WithEmoji text={attending === "no" ? t.thanksNo : attending === "maybe" ? t.thanksMaybe : t.thanksYes} name="smiling-hearts" />
            </p>
            <button type="button" className="sketch-button" onClick={close}>{t.close}</button>
          </div>
        ) : (
          <>
            <h2 id="rsvp-title" className="rsvp-dialog__title">{t.title}</h2>
            <p className="rsvp-dialog__intro">
              <WithEmoji text={t.intro[0]} name="heart-hands" /> <WithEmoji text={t.intro[1]} name="hugging" />
            </p>
            <form className="rsvp-form" onSubmit={submit} noValidate
                  onInput={ev => { const el = ev.target as Field; if (el.hasAttribute("aria-invalid")) mark(el); }}>
              <label className="field">
                <span className="field__label">{t.name}</span>
                <input name="name" required maxLength={120} autoComplete="name" />
              </label>

              <fieldset className="field field--choice">
                <legend className="field__label">{t.attending}</legend>
                {(["yes", "maybe", "no"] as const).map(v => (
                  <label className="choice" key={v}>
                    <input type="radio" name="attending" value={v} required onChange={ev => {
                      setAttending(v);
                      ev.currentTarget.form?.querySelectorAll("[name=attending]").forEach(el => el.removeAttribute("aria-invalid"));
                    }} />
                    <span>{t[v]}</span>
                  </label>
                ))}
              </fieldset>

              {attending === "yes" && (
                <>
                  <div className="field-row">
                    <label className="field">
                      <span className="field__label">{t.people}</span>
                      <select name="people" value={people} onChange={ev => setPeople(Number(ev.target.value))}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field__label">{t.children}</span>
                      <select name="children" defaultValue="0">
                        {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                  </div>
                  {people > 1 && (
                    <label className="field">
                      <span className="field__label">{t.others} <em>{t.optional}</em></span>
                      <input name="others" maxLength={400} />
                    </label>
                  )}
                  <label className="field">
                    <span className="field__label">{t.dietary} <em>{t.optional}</em></span>
                    <input name="dietary" maxLength={400} />
                  </label>
                </>
              )}

              <label className="field">
                <span className="field__label">{t.email}{attending === "no" && <> <em>{t.optional}</em></>}</span>
                <input type="email" name="email" required={attending !== "no"} maxLength={160} autoComplete="email" />
              </label>
              <label className="field">
                <span className="field__label">{t.note} <em>{t.optional}</em></span>
                <textarea name="note" rows={3} maxLength={2000} />
              </label>

              {/* left empty by people, filled in by spam bots (a name no browser autofills) */}
              <input className="rsvp-form__trap" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <div className="rsvp-form__send">
                <button type="submit" className="sketch-button" disabled={status === "sending"}>
                  {status === "sending" ? t.sending : t.send}
                </button>
                {status === "error" && <p className="rsvp-form__error" role="alert">{t.error}</p>}
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
