const TOTAL = 5;

type LoyaltyCardProps = {
  customerName: string;
  customerCode: string;
  stamps: number;
};

export function LoyaltyCard({ customerName, customerCode, stamps }: LoyaltyCardProps) {
  const progress = Math.max(0, Math.min(100, (stamps / TOTAL) * 100));

  return (
    <div className="stamp-card">
      <div className="sc-top">
        <div className="sc-brand">
          <div className="sc-wordmark">Macanudas</div>
          <small>loyalty card</small>
        </div>
        <div className="sc-code">{customerCode}</div>
      </div>

      <div className="stamp-row">
        {Array.from({ length: TOTAL }).map((_, index) => (
          <div key={index} className={`stamp-dot ${index < stamps ? 'stamped' : ''}`} />
        ))}
      </div>

      <div className="prog-wrap">
        <div className="prog-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="sc-bottom">
        <div className="sc-name">
          <small>customer</small>
          <span>{customerName}</span>
        </div>
        <div className="sc-progress">
          <small>stamps</small>
          <div className="big">{stamps}/{TOTAL}</div>
        </div>
      </div>
    </div>
  );
}
