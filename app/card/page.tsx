'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CardPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [card, setCard] = useState<any>(null);

  const [phoneDraft, setPhoneDraft] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg('');
      setMessage('');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      const currentUserId = session.user.id;
      setUserId(currentUserId);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .maybeSingle();

      if (profileError) {
        setErrorMsg(profileError.message);
        setLoading(false);
        return;
      }

      const { data: cardData, error: cardError } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (cardError) {
        setErrorMsg(cardError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setCard(cardData);
      setPhoneDraft(profileData?.phone || '');

      if (!profileData || !cardData) {
        setErrorMsg('Your fan card is still being prepared. Please try again.');
      }

      setLoading(false);
    }

    loadData();
  }, [supabase, router]);

  async function handleSavePhone() {
    if (!userId) return;

    setSavingPhone(true);
    setErrorMsg('');
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ phone: phoneDraft.trim() || null })
      .eq('id', userId);

    setSavingPhone(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setProfile((prev: any) => ({
      ...prev,
      phone: phoneDraft.trim() || null,
    }));

    setMessage('Phone updated successfully.');
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <main className="app-shell">
        <div className="panel center">Loading...</div>
      </main>
    );
  }

  const stampsCount = Math.max(0, Math.min(card?.stamps_count || 0, 5));
  const rewardUnlocked = stampsCount >= 5;

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand-wordmark">Macanudas</div>
        <div className="tagline">Fan Card</div>
      </header>

      <div className="stripe" />

      {errorMsg ? <div className="status error">{errorMsg}</div> : null}
      {message ? <div className="status success">{message}</div> : null}

      {rewardUnlocked ? (
        <div className="reward-banner">
          <div style={{ fontSize: '20px' }}>🎁</div>
          <div>
            <strong>Reward unlocked</strong>
            <span>Your next one is the gift.</span>
          </div>
        </div>
      ) : null}

      {profile && card ? (
        <>
          <section className="stamp-card">
            <div className="sc-top">
              <div className="sc-brand">
                <div className="sc-wordmark">MACANUDAS</div>
                <small>Empanadas</small>
              </div>
              <div className="sc-code">{profile.customer_code}</div>
            </div>

            <div
              className="stamp-row stamp-row-6"
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const isRewardSlot = i === 5;
                const isFilled = isRewardSlot ? rewardUnlocked : i < stampsCount;

                return (
                  <div
                    key={i}
                    className={`stamp-dot ${isFilled ? 'stamped' : ''} ${isRewardSlot ? 'reward-slot' : ''}`}
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
                style={{
                  width: `${(stampsCount / 5) * 100}%`,
                }}
              />
            </div>

            <div className="sc-bottom">
              <div className="sc-name">
                <small>Customer</small>
                {profile.full_name || '—'}
              </div>
              <div className="sc-progress">
                <small>Stamps</small>
                <div className="big">{stampsCount}/5</div>
              </div>
            </div>
          </section>

          <section className="info-card">
            <div className="info-row">
              <div className="info-label">Name</div>
              <div className="info-val">{profile.full_name || '—'}</div>
            </div>

            <div className="info-row">
              <div className="info-label">Email</div>
              <div className="info-val">{profile.email || '—'}</div>
            </div>

            <div style={{ paddingTop: '10px' }}>
              <div className="field" style={{ marginBottom: '10px' }}>
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="Add your phone number"
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                />
              </div>

              <button
                className="btn btn-red btn-compact"
                type="button"
                onClick={handleSavePhone}
                disabled={savingPhone}
              >
                {savingPhone ? 'Saving...' : 'Save phone'}
              </button>
            </div>
          </section>
        </>
      ) : null}

      <section className="panel center">
        <button className="btn btn-outline btn-compact" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </section>

      <div className="footer-note">
        Macanudas Empanadas · Loyalty Program
      </div>
    </main>
  );
}