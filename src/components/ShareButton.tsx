import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Share2 } from 'lucide-react';
import { buildShareUrl, MAX_NAME_LENGTH, validateName } from '../lib/name';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy copy */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

type Status = { tone: 'ok' | 'error'; text: string } | null;

/** Shares a personalized link via the Web Share API, falling back to copying the link. */
export function ShareButton({ senderName }: { senderName: string }) {
  const inputId = useId();
  const statusId = useId();
  const [friend, setFriend] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  const share = async () => {
    let friendName = '';
    if (friend.trim()) {
      const result = validateName(friend);
      if (result.error) {
        setStatus({ tone: 'error', text: "Please use letters for your friend's name 🙂" });
        return;
      }
      friendName = result.name;
    }

    const url = buildShareUrl({ name: friendName, from: senderName });
    const text = friendName
      ? `🪔 ${friendName}, ${senderName} has lit a special Diwali wish just for you. Open your surprise ✨`
      : `🪔 ${senderName} is sending you a little light and a lot of happiness this Diwali! Unlock your personal Diwali surprise ✨`;

    setBusy(true);
    setStatus(null);
    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: 'A Diwali Surprise For You 🪔', text, url });
          setStatus({ tone: 'ok', text: 'Shared with love! ✨' });
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
        }
      }
      const ok = await copyText(`${text}\n${url}`);
      setStatus(
        ok
          ? { tone: 'ok', text: 'Link copied! Paste it anywhere to share the light.' }
          : { tone: 'error', text: `Copy this link to share: ${url}` },
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <label htmlFor={inputId} className="mb-3 block text-sm tracking-wide text-champagne/75">
        Send this light to someone special <span className="text-champagne/45">(optional)</span>
      </label>
      <div className="gold-field rounded-full p-px">
        <input
          id={inputId}
          type="text"
          value={friend}
          maxLength={MAX_NAME_LENGTH + 20}
          autoComplete="off"
          enterKeyHint="send"
          placeholder="Your friend's name..."
          aria-describedby={statusId}
          onChange={(e) => {
            setFriend(e.target.value);
            if (status?.tone === 'error') setStatus(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void share();
            }
          }}
          className="w-full rounded-full bg-[#170A11] px-6 py-3.5 text-center text-base text-champagne placeholder:text-champagne/35 focus:outline-none"
        />
      </div>

      <motion.button
        type="button"
        onClick={share}
        disabled={busy}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="btn-gold mt-5 w-full sm:w-auto"
      >
        <Share2 className="size-5" aria-hidden="true" />
        Share This Happiness
      </motion.button>

      <div id={statusId} aria-live="polite" className="min-h-12 pt-3">
        <AnimatePresence mode="wait">
          {status && (
            <motion.p
              key={status.text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`inline-flex items-center gap-2 break-all text-sm ${status.tone === 'ok' ? 'text-champagne' : 'text-[#FFB4A8]'}`}
            >
              {status.tone === 'ok' && <Check className="size-4 shrink-0" aria-hidden="true" />}
              {status.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
