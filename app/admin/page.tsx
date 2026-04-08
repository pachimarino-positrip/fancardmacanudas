'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  customer_code: string | null;
  role: string | null;
};

type LoyaltyCard = {
  user_id: string;
  stamps_count: number;
  rewards_redeemed: number;
};

type CustomerRow = {
  profile: Profile;
  card: LoyaltyCard | null;
};

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState('');

  async function loadCustomers() {
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/login?next=/admin');
      return;
    }

    const { data: me } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!me || !['admin', 'cashier'].includes(me.role || '')) {
      router.replace('/login?next=/admin');
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (profilesError) {
      setErrorMsg(profilesError.message);
      setLoading(false);
      return;
    }

    const { data: cards, error: cardsError } = await supabase
      .from('loyalty_cards')
      .select('*');

    if (cardsError) {
      setErrorMsg(cardsError.message);
      setLoading(false);
      return;
    }

    const cardsMap = new Map<string, LoyaltyCard>();
    (cards || []).forEach((card: LoyaltyCard) => {
      cardsMap.set(card.user_id, card);
    });

    const merged: CustomerRow[] = (profiles || []).map((profile: Profile) => ({
      profile,
      card: cardsMap.get(profile.id) || {
        user_id: profile.id,
        stamps_count: 0,
        rewards_redeemed: 0,
      },
    }));

    setCustomers(merged);

    if (selected) {
      const refreshedSelected =
        merged.find((c) => c.profile.id === selected.profile.id) || null;
      setSelected(refreshedSelected);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  async function handleAddStamp() {
    if (!selected?.card) return;

    const current = selected.card.stamps_count || 0;

    if (current >= 5) {
      setErrorMsg('Reward already unlocked. Redeem it first.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setMessage('');

    const nextCount = current + 1;

    setSelected((prev) =>
      prev
        ? {
            ...prev,
            card: {
              ...prev.card!,
              stamps_count: nextCount,
            },
          }
        : prev
    );

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.profile.id === selected.profile.id
          ? {
              ...customer,
              card: {
                ...(customer.card || {
                  user_id: selected.profile.id,
                  rewards_redeemed: 0,
                }),
                stamps_count: nextCount,
              },
            }
          : customer
      )
    );

    const { error } = await supabase
      .from('loyalty_cards')
      .update({ stamps_count: nextCount })
      .eq('user_id', selected.profile.id);

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      await loadCustomers();
      return;
    }

    setMessage('Stamp added successfully.');
    await loadCustomers();
  }

  async function handleRedeemReward() {
    if (!selected?.card) return;

    const current = selected.card.stamps_count || 0;

    if (current < 5) {
      setErrorMsg('Reward is not unlocked yet.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setMessage('');

    const nextRedeemed = (selected.card.rewards_redeemed || 0) + 1;

    setSelected((prev) =>
      prev
        ? {
            ...prev,
            card: {
              ...prev.card!,
              stamps_count: 0,
              rewards_redeemed: nextRedeemed,
            },
          }
        : prev
    );

    setCustomers((prev) =>
      prev.map((customer) =>
        customer.profile.id === selected.profile.id
          ? {
              ...customer,
              card: {
                ...(customer.card || {
                  user_id: selected.profile.id,
                }),
                stamps_count: 0,
                rewards_redeemed: nextRedeemed,
              },
            }
          : customer
      )
    );

    const { error } = await supabase
      .from('loyalty_cards')
      .update({
        stamps_count: 0,
        rewards_redeemed: nextRedeemed,
      })
      .eq('user_id', selected.profile.id);

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      await loadCustomers();
      return;
    }

    setMessage('Reward redeemed successfully.');
    await loadCustomers();
  }

  const filteredCustomers = customers.filter((customer) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const name = customer.profile.full_name?.toLowerCase() || '';
    const email = customer.profile.email?.toLowerCase() || '';
    const phone = customer.profile.phone?.toLowerCase() || '';
    const code = customer.profile.customer_code?.toLowerCase() || '';

    return (
      name.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      code.includes(q)
    );
  });

const completedCardsCount = customers.reduce(
  (total, customer) => total + (customer.card?.rewards_redeemed || 0),
  0
);

  const selectedStamps = Math.max(
    0,
    Math.min(selected?.card?.stamps_count || 0, 5)
  );
  const rewardUnlocked = selectedStamps >= 5;

  if (loading) {
    return (
      <main className="app-shell">
        <div className="panel center">Loading cashier panel...</div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand-wordmark">Macanudas</div>
        <div className="tagline">Cashier Panel</div>
      </header>

      <div className="stripe" />

      {errorMsg ? <div className="status error">{errorMsg}</div> : null}
      {message ? <div className="status success">{message}</div> : null}

      <section className="panel">
        <div className="panel-title">
          Cashier <span>overview</span>
        </div>

        <div className="info-row" style={{ borderBottom: 'none', padding: 0 }}>
          <div className="info-label">Ready</div>
          <div className="info-val">{completedCardsCount} completed cards</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          Find <span>customer</span>
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label>Search</label>
          <input
            type="text"
            placeholder="Name, email, phone or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          Customer <span>list</span>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="helper-text">No customers found.</div>
        ) : (
          filteredCustomers.map((customer) => {
            const stamps = Math.max(
              0,
              Math.min(customer.card?.stamps_count || 0, 5)
            );
            const complete = stamps >= 5;
            const initial = (
              customer.profile.full_name ||
              customer.profile.email ||
              '?'
            )
              .charAt(0)
              .toUpperCase();

            return (
              <button
                key={customer.profile.id}
                type="button"
                className="client-row"
                onClick={() => setSelected(customer)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div className="client-avatar">{initial}</div>

                <div className="client-info-col">
                  <strong>
                    {customer.profile.full_name || 'Unnamed customer'}
                  </strong>
                  <span>
                    {customer.profile.customer_code ||
                      customer.profile.email ||
                      '—'}
                  </span>
                </div>

                <div className={`stamp-pill ${complete ? 'complete' : ''}`}>
                  {complete ? 'Reward ready' : `${stamps}/5`}
                </div>
              </button>
            );
          })
        )}
      </section>

      {selected ? (
        <>
          {rewardUnlocked ? (
            <div className="reward-banner">
              <div style={{ fontSize: '20px' }}>🎁</div>
              <div>
                <strong>Reward unlocked</strong>
                <span>The 6th circle is the gift.</span>
              </div>
            </div>
          ) : null}

          <section className="stamp-card">
            <div className="sc-top">
              <div className="sc-brand">
                <div className="sc-wordmark">MACANUDAS</div>
                <small>Empanadas</small>
              </div>
              <div className="sc-code">
                {selected.profile.customer_code || '—'}
              </div>
            </div>

            <div className="stamp-row stamp-row-6">
              {Array.from({ length: 6 }).map((_, i) => {
                const isRewardSlot = i === 5;
                const isFilled = isRewardSlot
                  ? rewardUnlocked
                  : i < selectedStamps;

                return (
                  <div
                    key={i}
                    className={`stamp-dot ${isFilled ? 'stamped' : ''} ${
                      isRewardSlot ? 'reward-slot' : ''
                    }`}
                  >
                    {isRewardSlot ? (
                      <span className="stamp-gift">🎁</span>
                    ) : isFilled ? (
                      <span className="stamp-mark">M</span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="prog-wrap">
              <div
                className="prog-bar"
                style={{ width: `${(selectedStamps / 5) * 100}%` }}
              />
            </div>

            <div className="sc-bottom">
              <div className="sc-name">
                <small>Customer</small>
                {selected.profile.full_name || '—'}
              </div>
              <div className="sc-progress">
                <small>Stamps</small>
                <div className="big">{selectedStamps}/5</div>
              </div>
            </div>
          </section>

<section className="info-card">
  <div className="info-row">
    <div className="info-label">Name</div>
    <div className="info-val">{selected.profile.full_name || '—'}</div>
  </div>

  <div className="info-row">
    <div className="info-label">Email</div>
    <div className="info-val">{selected.profile.email || '—'}</div>
  </div>

  <div className="info-row">
    <div className="info-label">Phone</div>
    <div className="info-val">{selected.profile.phone || '—'}</div>
  </div>

  <div className="info-row">
    <div className="info-label">Cards</div>
    <div className="info-val">{selected.card?.rewards_redeemed || 0} completed</div>
  </div>
</section>

          <section className="panel">
            <div className="actions-grid">
              <button
                className="btn-stamp"
                type="button"
                onClick={handleAddStamp}
                disabled={saving || selectedStamps >= 5}
              >
                {saving ? 'Saving...' : 'Add stamp'}
              </button>

              <button
                className="btn-redeem"
                type="button"
                onClick={handleRedeemReward}
                disabled={saving || selectedStamps < 5}
              >
                {saving ? 'Saving...' : 'Redeem reward'}
              </button>
            </div>
          </section>
        </>
      ) : null}

      <section className="panel center">
        <button
          className="btn btn-outline btn-compact"
          type="button"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </section>

      <div className="footer-note">
        Macanudas Empanadas · Cashier Panel
      </div>
    </main>
  );
}