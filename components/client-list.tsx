import { ClientSearchRow } from '@/lib/types';

export function ClientList({
  clients,
  onSelect,
}: {
  clients: ClientSearchRow[];
  onSelect: (client: ClientSearchRow) => void;
}) {
  if (!clients.length) {
    return (
      <div className="center muted small" style={{ padding: '24px 0' }}>
        No customers found.
      </div>
    );
  }

  return (
    <div>
      {clients.map((client) => {
        const stamps = client.loyalty_cards?.[0]?.stamps_count ?? 0;
        const isComplete = stamps >= 5;

        return (
          <button
            key={client.id}
            type="button"
            className="client-row"
            onClick={() => onSelect(client)}
            style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
          >
            <div className="client-avatar">{(client.full_name ?? client.email ?? '?').slice(0, 1).toUpperCase()}</div>
            <div className="client-info-col">
              <strong>{client.full_name || 'Unnamed customer'}</strong>
              <span>{client.customer_code} · {client.phone || client.email || 'No contact'}</span>
            </div>
            <div className={`stamp-pill ${isComplete ? 'complete' : ''}`}>
              {isComplete ? 'Complete' : `${stamps}/5`}
            </div>
          </button>
        );
      })}
    </div>
  );
}
