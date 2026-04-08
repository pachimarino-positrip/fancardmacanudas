export function RewardBanner({ admin = false }: { admin?: boolean }) {
  return (
    <div className="reward-banner">
      <div style={{ fontSize: 26 }} aria-hidden>
        {admin ? '🎁' : '🎉'}
      </div>
      <div>
        <strong>{admin ? 'Card complete!' : 'Reward available!'}</strong>
        <span>
          {admin
            ? 'You can redeem the reward now. Once redeemed, the card resets to zero.'
            : 'Show this code to the cashier to claim your reward. After redemption, your card resets to zero.'}
        </span>
      </div>
    </div>
  );
}
