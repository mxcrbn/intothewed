"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { RSVP_TEXT, type Lang } from "./i18n";
import { RSVP_ENDPOINT } from "./rsvp-config";

type Status = "idle" | "sending" | "sent" | "error";

// The RSVP form, on a full sheet of paper over the card. Answers go to the Google Apps Script
// (tools/rsvp/Code.gs), which adds a row to the RSVP sheet and emails Nóri & Max.
export default function RsvpDialog({ lang, open, onClose }: { lang: Lang; open: boolean; onClose: () => void }) {
  const t = RSVP_TEXT[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  const [attending, setAttending] = useState<"" | "yes" | "no">("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open, mounted]);

  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(ev.currentTarget));
    setStatus("sending");
    try {
      // a plain-text body keeps this a "simple" request: no CORS preflight, which Apps Script can't answer
      const res = await fetch(RSVP_ENDPOINT, { method: "POST", body: JSON.stringify({ ...data, lang }) });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (!mounted) return null;
  return createPortal(
    <dialog ref={dialog} className="rsvp-dialog" onClose={onClose} aria-labelledby="rsvp-title" lang={lang}>
      <button type="button" className="rsvp-dialog__close" onClick={onClose} aria-label={t.close}>×</button>
      <div className="rsvp-dialog__inner">
        <img className="rsvp-dialog__rings" src="/assets/rings/rings.png" width={1536} height={960} alt="" />
        <h2 id="rsvp-title" className="rsvp-dialog__title">{t.title}</h2>

        {status === "sent" ? (
          <div className="rsvp-dialog__done">
            <p className="rsvp-dialog__thanks" role="status">{attending === "no" ? t.thanksNo : t.thanksYes}</p>
            <button type="button" className="sketch-button" onClick={onClose}>{t.close}</button>
          </div>
        ) : (
          <form className="rsvp-form" onSubmit={submit}>
            <label className="field">
              <span className="field__label">{t.name}</span>
              <input name="name" required maxLength={120} autoComplete="name" />
            </label>

            <fieldset className="field field--choice">
              <legend className="field__label">{t.attending}</legend>
              <label className="choice">
                <input type="radio" name="attending" value="yes" required onChange={() => setAttending("yes")} />
                <span>{t.yes}</span>
              </label>
              <label className="choice">
                <input type="radio" name="attending" value="no" onChange={() => setAttending("no")} />
                <span>{t.no}</span>
              </label>
            </fieldset>

            {attending === "yes" && (
              <>
                <div className="field-row">
                  <label className="field">
                    <span className="field__label">{t.people}</span>
                    <select name="people" defaultValue="1">
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
                <label className="field">
                  <span className="field__label">{t.others} <em>{t.optional}</em></span>
                  <input name="others" maxLength={400} />
                </label>
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

            {/* left empty by people, filled in by spam bots */}
            <input className="rsvp-form__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div className="rsvp-form__send">
              <button type="submit" className="sketch-button" disabled={status === "sending"}>
                {status === "sending" ? t.sending : t.send}
              </button>
              {status === "error" && <p className="rsvp-form__error" role="alert">{t.error}</p>}
            </div>
          </form>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
