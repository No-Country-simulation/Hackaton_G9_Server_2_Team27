import { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getOrCreateSessionId, isTelegramLinked, markTelegramAsLinked } from '@/utils/telegramSession';
import { consultarVinculacionTelegram } from '@/services/analisisService';

const BOT_USERNAME = 'EnergiAI_27_bot';

/**
 * Botón que permite al usuario vincular su cuenta de Telegram con un solo
 * toque. Una vez vinculado, queda guardado en el navegador para siempre
 * y este componente muestra el estado "conectado" en cualquier página.
 */
export default function TelegramLinkButton() {
  const [linked, setLinked] = useState(isTelegramLinked());
  const [esperando, setEsperando] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleVincular = () => {
    const sessionId = getOrCreateSessionId();
    const link = `https://t.me/${BOT_USERNAME}?start=${sessionId}`;
    window.open(link, '_blank');

    setEsperando(true);

    intervalRef.current = setInterval(async () => {
      const vinculado = await consultarVinculacionTelegram(sessionId);
      if (vinculado) {
        markTelegramAsLinked();
        setLinked(true);
        setEsperando(false);
        clearInterval(intervalRef.current);
      }
    }, 3000);
  };

  if (linked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#16a34a', fontWeight: '500' }}>
        <CheckCircle2 size={18} />
        <span>Telegram vinculado</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleVincular}
      disabled={esperando}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.1rem',
        borderRadius: '0.75rem',
        border: 'none',
        backgroundColor: esperando ? '#7fc2e3' : '#229ED9',
        color: '#ffffff',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: esperando ? 'default' : 'pointer',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 240 240" fill="none">
        <circle cx="120" cy="120" r="120" fill="white" fillOpacity="0.15" />
        <path
          d="M180 72L157 178c-2 9-7 11-14 7l-39-29-19 18c-2 2-4 4-8 4l3-40 73-66c3-3-1-5-5-2l-90 57-39-12c-8-3-8-8 2-12l153-59c7-2 13 2 11 12z"
          fill="white"
        />
      </svg>
      {esperando ? 'Esperando confirmación en Telegram…' : 'Vincular Telegram'}
    </button>
  );
}
