import React, { useState, useEffect } from 'react';
import { Play, Square, Settings, Package, TrendingUp, Users, Cpu, Zap, ShieldCheck, ChevronRight, Menu, ShoppingCart, Tag, BarChart3, CheckCircle, X, Edit2, Save, Star, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import heroBg from './assets/hero_bg.png';
import maniocImg from './assets/manioc.png';
import maisImg from './assets/mais.png';

const API_BASE = 'http://127.0.0.1:8000/api';

// ─── MOCK DATA ──────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, nom: 'Manioc Premium', prix_kg: 1500, image: maniocImg, description: 'Farine de manioc extra-blanche, idéale pour chikwangue et fufu.', stock_kg: 120, promotion: false },
  { id: 2, nom: 'Maïs Local', prix_kg: 1200, image: maisImg, description: 'Maïs jaune de qualité supérieure, parfait pour la farine de maïs.', stock_kg: 85, promotion: true, promo_label: '-10%' },
  { id: 3, nom: 'Soja Entier', prix_kg: 2000, image: maniocImg, description: 'Soja sélectionné pour une farine riche en protéines.', stock_kg: 60, promotion: false },
];

const MOCK_INVENTORY = {
  jour: { kg: 245.5, chiffre: 368250, clients: 42 },
  mois: { kg: 5820, chiffre: 8730000, clients: 924 },
  annee: { kg: 68400, chiffre: 102600000, clients: 10800 },
};

// ─── STYLES ─────────────────────────────────────────────────
const c = {
  primary: '#00B14F',
  dark: '#1A1A1A',
  muted: '#6B7280',
  bg: '#F9FAFB',
  white: '#ffffff',
};

const S = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 20px rgba(0,0,0,0.05)' },
  navInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem', maxWidth: 1280, margin: '0 auto' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  logoIcon: { width: 42, height: 42, background: c.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 20 },
  logoText: { fontSize: '1.2rem', fontWeight: 800 },
  navLinks: { display: 'flex', alignItems: 'center', gap: '1.8rem', fontWeight: 500 },
  navDashBtn: { background: '#E6F7ED', color: c.primary, padding: '0.5rem 1.2rem', borderRadius: 9999, fontWeight: 700, border: 'none', cursor: 'pointer' },
  hero: { position: 'relative', height: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' },
  heroBgImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', inset: 0, zIndex: 0 },
  heroScrim: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,.7) 35%, rgba(0,177,79,.2))' },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', color: '#fff', width: '100%' },
  h1: { fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.2rem', color: '#fff' },
  heroDesc: { fontSize: '1.15rem', maxWidth: 540, marginBottom: '2rem', color: 'rgba(255,255,255,.85)', lineHeight: 1.7 },
  heroActions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  btnGreen: { padding: '1rem 2.2rem', borderRadius: 9999, fontWeight: 700, fontSize: '1rem', background: c.primary, color: '#fff', border: 'none', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 6px 20px rgba(0,177,79,.35)' },
  btnOutline: { padding: '1rem 2.2rem', borderRadius: 9999, fontWeight: 700, fontSize: '1rem', background: 'rgba(255,255,255,.12)', color: '#fff', border: '2px solid rgba(255,255,255,.6)', cursor: 'pointer', transition: 'all .2s' },
  section: { padding: '5rem 0' },
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' },
  sectionTitle: { fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '.6rem' },
  sectionSub: { color: c.muted, marginBottom: '3rem' },
  autoGrid: (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: '1.5rem' }),
  card: { background: '#fff', borderRadius: 22, boxShadow: '0 2px 16px rgba(0,0,0,.06)', overflow: 'hidden' },
  featureCard: { padding: '2rem', borderRadius: 20, background: '#F9FAFB', borderLeft: '4px solid #00B14F' },
  productBadge: (promo) => ({ position: 'absolute', top: 14, right: 14, background: promo ? '#F59E0B' : c.primary, color: '#fff', padding: '0.25rem 0.8rem', borderRadius: 9999, fontWeight: 700, fontSize: '.85rem' }),
  promoTag: { position: 'absolute', top: 14, left: 14, background: '#EF4444', color: '#fff', padding: '0.2rem .7rem', borderRadius: 9999, fontSize: '.75rem', fontWeight: 700 },
  btnSelect: { width: '100%', padding: '.75rem', borderRadius: 9999, border: `2px solid ${c.primary}`, color: c.primary, background: 'transparent', fontWeight: 700, cursor: 'pointer', marginTop: '.5rem', fontSize: '.95rem', transition: 'all .2s' },
  promoCard: { borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(135deg, #00B14F, #008F3F)', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' },
  promoGlow: { position: 'absolute', width: 160, height: 160, background: 'rgba(255,255,255,.1)', borderRadius: '50%', bottom: -40, right: -40 },
  footer: { background: '#111827', color: '#fff', padding: '5rem 0 2rem' },
  footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' },
  footerMuted: { color: '#6B7280', fontSize: '.9rem', lineHeight: 1.8 },
  footerBottom: { borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', color: '#4B5563', fontSize: '.85rem' },
};

// ─── DASHBOARD STYLES ────────────────────────────────────────
const DS = {
  dashBg: { background: '#F1F5F9', padding: '2.5rem 0 5rem' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' },
  card: { background: '#fff', padding: '1.8rem', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,.07)', marginBottom: '1.2rem' },
  sectionHead: { fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.2rem', color: c.dark },
  controlGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' },
  btnLancer: (dis) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem', padding: '1.3rem', borderRadius: 16, fontSize: '1rem', fontWeight: 800, cursor: dis ? 'not-allowed' : 'pointer', background: dis ? '#F1F5F9' : c.primary, color: dis ? '#9CA3AF' : '#fff', boxShadow: dis ? 'none' : '0 6px 18px rgba(0,177,79,.3)', border: 'none', transition: 'all .2s' }),
  btnFermer: (dis) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem', padding: '1.3rem', borderRadius: 16, fontSize: '1rem', fontWeight: 800, cursor: dis ? 'not-allowed' : 'pointer', background: dis ? '#F1F5F9' : '#1A1A1A', color: dis ? '#9CA3AF' : '#fff', border: 'none', transition: 'all .2s' }),
  productRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem', borderRadius: 14, background: '#F9FAFB', marginBottom: '.6rem', cursor: 'pointer', transition: 'all .2s' },
  productRowActive: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem', borderRadius: 14, background: '#E6F7ED', border: `2px solid ${c.primary}`, marginBottom: '.6rem', cursor: 'pointer' },
  productRowImg: { width: 50, height: 50, borderRadius: 10, objectFit: 'cover' },
  tabContainer: { display: 'flex', gap: '.5rem', marginBottom: '1.5rem', background: '#F1F5F9', padding: '.3rem', borderRadius: 12 },
  tab: (active) => ({ flex: 1, padding: '.6rem', textAlign: 'center', borderRadius: 10, fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', background: active ? '#fff' : 'transparent', color: active ? c.primary : c.muted, boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none', border: 'none', transition: 'all .2s' }),
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  statBox: { background: '#F9FAFB', borderRadius: 14, padding: '1rem', textAlign: 'center' },
  statNum: { fontSize: '1.6rem', fontWeight: 900, color: c.primary, display: 'block' },
  statLabel: { fontSize: '.78rem', color: c.muted, fontWeight: 500 },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.8rem 0', borderBottom: '1px solid #F1F5F9' },
  priceInput: { width: 100, textAlign: 'right', padding: '.4rem .6rem', border: `1px solid #E5E7EB`, borderRadius: 8, fontSize: '.9rem', fontWeight: 600, color: c.primary },
  monitor: { background: '#1A1A1A', color: '#fff', padding: '2rem', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,.2)', position: 'sticky', top: 88, overflow: 'hidden' },
  monGlow: { position: 'absolute', width: 200, height: 200, background: 'rgba(0,177,79,.12)', borderRadius: '50%', filter: 'blur(50px)', top: -50, right: -50 },
  statusBadge: (r) => ({ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.3rem .8rem', borderRadius: 9999, fontSize: '.72rem', fontWeight: 700, background: r ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: r ? '#4ade80' : '#f87171' }),
  weightVal: { fontSize: '5.5rem', fontWeight: 900, color: c.primary, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
};

// ─── APP ────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('home');
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selected, setSelected] = useState(MOCK_PRODUCTS[0]);
  const [liveKg, setLiveKg] = useState(0);
  const [running, setRunning] = useState(false);
  const [invPeriod, setInvPeriod] = useState('jour');
  const [editingPrices, setEditingPrices] = useState(false);
  const [editedPrices, setEditedPrices] = useState({});
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/products/`).then(r => setProducts(r.data)).catch(() => { });
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (running) setLiveKg(k => Math.round((k + 0.05) * 1000) / 1000);
    }, 1000);
    return () => clearInterval(iv);
  }, [running]);

  const sendCommand = async (action) => {
    try { await axios.post(`${API_BASE}/commands/${action === 'START' ? 'start' : 'stop'}_mill/`, {}); } catch (_) { }
    setRunning(action === 'START');
    if (action === 'STOP') setLiveKg(0);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev;
      return [...prev, { ...product, quantiteCmd: 1 }];
    });
  };

  const validerCommande = () => {
    alert(`✅ Commande validée !\n${cart.map(i => `${i.nom}: ${i.quantiteCmd} kg`).join('\n')}\nTotal: ${cart.reduce((s, i) => s + i.prix_kg * i.quantiteCmd, 0).toLocaleString()} FCFA`);
    setCart([]);
    setCartOpen(false);
  };

  const savePrices = () => {
    setProducts(prev => prev.map(p => editedPrices[p.id] ? { ...p, prix_kg: parseInt(editedPrices[p.id]) } : p));
    setEditingPrices(false);
  };

  const inv = MOCK_INVENTORY[invPeriod];

  return (
    <div>
      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>M</div>
            <span style={S.logoText}>Mayele<span style={{ color: c.primary }}>Moule 2.0</span></span>
          </div>
          <div style={S.navLinks}>
            <a onClick={() => setTab('home')} style={{ cursor: 'pointer' }}>Accueil</a>
            <a onClick={() => { setTab('home'); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ cursor: 'pointer' }}>Services</a>
            <a onClick={() => { setTab('home'); setTimeout(() => document.getElementById('promo')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ cursor: 'pointer' }}>Offres</a>
            <button style={{ ...S.navDashBtn, position: 'relative' }} onClick={() => setTab('dashboard')}>
              Dashboard
            </button>
            <button onClick={() => setCartOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: c.primary }}>
              <ShoppingCart size={22} />
              {cart.length > 0 && <span style={{ position: 'absolute', top: -6, right: -8, background: '#EF4444', color: '#fff', fontSize: '.65rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* ── CART MODAL ── */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} style={{ background: '#fff', width: 380, height: '100vh', overflowY: 'auto', padding: '2rem', boxShadow: '-10px 0 40px rgba(0,0,0,.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Ma Commande</h3>
                <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
              </div>
              {cart.length === 0 ? <p style={{ color: c.muted }}>Votre panier est vide.</p> : (
                <>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', padding: '1rem', background: '#F9FAFB', borderRadius: 14 }}>
                      <img src={item.image || maniocImg} alt={item.nom} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{item.nom}</div>
                        <div style={{ color: c.muted, fontSize: '.85rem' }}>{item.prix_kg.toLocaleString()} FCFA/kg</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.5rem' }}>
                          <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantiteCmd: Math.max(1, i.quantiteCmd - 1) } : i))} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${c.primary}`, background: '#fff', cursor: 'pointer', color: c.primary, fontWeight: 700 }}>-</button>
                          <span style={{ fontWeight: 700 }}>{item.quantiteCmd} kg</span>
                          <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantiteCmd: i.quantiteCmd + 1 } : i))} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${c.primary}`, background: '#fff', cursor: 'pointer', color: c.primary, fontWeight: 700 }}>+</button>
                          <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><X size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop: '2px solid #F1F5F9', paddingTop: '1rem', marginTop: '.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                      <span>Total estimé</span>
                      <span style={{ color: c.primary }}>{cart.reduce((s, i) => s + i.prix_kg * i.quantiteCmd, 0).toLocaleString()} FCFA</span>
                    </div>
                    <button onClick={validerCommande} style={{ ...S.btnGreen, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                      <CheckCircle size={18} /> Valider la Commande
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ paddingTop: 72 }}>
        {tab === 'home' ? (
          <>
            {/* ── HERO ── */}
            <section id="home" style={S.hero}>
              <div style={S.heroOverlay}>
                <img src={heroBg} alt="bg" style={S.heroBgImg} />
                <div style={S.heroScrim} />
              </div>
              <div style={S.heroContent}>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
                  <h1 style={S.h1}>Mouture <span style={{ color: c.primary }}>Professionnelle</span><br />de Qualité</h1>
                  <p style={S.heroDesc}>Découvrez l'excellence technologique au service de l'agriculture locale. Précision, hygiène et rapidité garanties.</p>
                  <div style={S.heroActions}>
                    <button style={S.btnGreen} onClick={() => setTab('dashboard')}>Lancer maintenant</button>
                    <button style={S.btnOutline} onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Voir nos Produits</button>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ── FEATURES (UC2) ── */}
            <section id="services" style={{ ...S.section, background: '#fff' }}>
              <div style={S.container}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <h2 style={S.sectionTitle}>Pourquoi Choisir <span style={{ color: c.primary }}>MayeleMoule?</span></h2>
                  <p style={S.sectionSub}>Une expertise reconnue dans le traitement des céréales et tubercules locaux.</p>
                </div>
                <div style={S.autoGrid(260)}>
                  {[
                    { icon: <Zap size={22} />, t: 'Rapidité', d: 'Votre produit moud en quelques minutes grâce à nos machines haute performance.' },
                    { icon: <ShieldCheck size={22} />, t: 'Hygiène', d: 'Processus contrôlé et environnement certifié pour une farine saine et pure.' },
                    { icon: <TrendingUp size={22} />, t: 'Précision', d: 'Mesure électronique exacte au gramme près pour chaque client, chaque fois.' },
                    { icon: <Tag size={22} />, t: 'Prix Juste', d: 'Tarifs transparents affichés en temps réel. Pas de surprise à la caisse.' },
                  ].map((f, i) => (
                    <motion.div key={i} whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,177,79,.1)' }} style={S.featureCard}>
                      <div style={{ width: 46, height: 46, background: '#E6F7ED', color: c.primary, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>{f.icon}</div>
                      <h3 style={{ fontWeight: 700, marginBottom: '.4rem' }}>{f.t}</h3>
                      <p style={{ color: c.muted, fontSize: '.9rem', lineHeight: 1.6 }}>{f.d}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── PROMOTIONS & OFFRES (UC4) ── */}
            <section id="promo" style={{ ...S.section, background: '#F9FAFB' }}>
              <div style={S.container}>
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={S.sectionTitle}>Offres & <span style={{ color: c.primary }}>Promotions</span></h2>
                  <p style={S.sectionSub}>Profitez des meilleures offres de l'artisan cette semaine.</p>
                </div>
                <div style={S.autoGrid(300)}>
                  <div style={S.promoCard}>
                    <div style={S.promoGlow} />
                    <Gift size={28} />
                    <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>Offre Spéciale Maïs</h3>
                    <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.9rem' }}>10% de réduction sur la farine de maïs pour toute mouture supérieure à 5 kg.</p>
                    <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '.7rem 1rem', display: 'inline-block', fontWeight: 800, fontSize: '1.4rem' }}>–10%</div>
                  </div>
                  <div style={{ ...S.promoCard, background: 'linear-gradient(135deg, #1E293B, #0F172A)' }}>
                    <div style={{ ...S.promoGlow, background: 'rgba(255,200,0,.08)' }} />
                    <Star size={28} color="#F59E0B" />
                    <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>Fidélité Artisan</h3>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem' }}>Revenez 5 fois et obtenez votre 6ème mouture de manioc gratuite jusqu'à 2 kg.</p>
                    <div style={{ background: 'rgba(245,158,11,.2)', borderRadius: 12, padding: '.7rem 1rem', display: 'inline-block', fontWeight: 800, fontSize: '1rem', color: '#F59E0B' }}>Programme Fidélité</div>
                  </div>
                  <div style={{ ...S.promoCard, background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                    <div style={S.promoGlow} />
                    <Package size={28} />
                    <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>Commande en Gros</h3>
                    <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.9rem' }}>Pour toute commande supérieure à 25 kg, bénéficiez d'une livraison prioritaire.</p>
                    <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '.7rem 1rem', display: 'inline-block', fontWeight: 800, fontSize: '.95rem' }}>À partir de 25 kg</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── PRODUITS (UC2) ── */}
            <section id="products" style={{ ...S.section, background: '#fff' }}>
              <div style={S.container}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                  <div>
                    <h2 style={S.sectionTitle}>Nos <span style={{ color: c.primary }}>Produits</span></h2>
                    <p style={{ color: c.muted }}>Sélectionnez et commandez directement depuis l'application.</p>
                  </div>
                  <button onClick={() => setCartOpen(true)} style={{ ...S.navDashBtn, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <ShoppingCart size={16} /> Panier ({cart.length})
                  </button>
                </div>
                <div style={S.autoGrid(280)}>
                  {products.map(p => (
                    <motion.div key={p.id} whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,.1)' }} style={S.card}>
                      <div style={{ position: 'relative', overflow: 'hidden', height: 220 }}>
                        <img src={p.image || (p.id % 2 === 0 ? maisImg : maniocImg)} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }} />
                        <div style={S.productBadge(p.promotion)}>{(p.prix_kg || 0).toLocaleString()} FCFA/kg</div>
                        {p.promotion && <div style={S.promoTag}>{p.promo_label || 'PROMO'}</div>}
                      </div>
                      <div style={{ padding: '1.4rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '.3rem' }}>{p.nom}</h3>
                        <p style={{ color: c.muted, fontSize: '.88rem', marginBottom: '.8rem', lineHeight: 1.5 }}>{p.description}</p>
                        <p style={{ fontSize: '.8rem', color: p.stock_kg < 50 ? '#EF4444' : c.primary, fontWeight: 600 }}>Stock: {p.stock_kg || '—'} kg</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem', marginTop: '.8rem' }}>
                          <button style={S.btnSelect} onClick={() => { setSelected(p); setTab('dashboard'); }}
                            onMouseEnter={e => { e.target.style.background = c.primary; e.target.style.color = '#fff'; }}
                            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = c.primary; }}>
                            Moudre
                          </button>
                          <button style={{ ...S.btnSelect, borderColor: '#1A1A1A', color: '#1A1A1A' }} onClick={() => addToCart(p)}
                            onMouseEnter={e => { e.target.style.background = '#1A1A1A'; e.target.style.color = '#fff'; }}
                            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1A1A1A'; }}>
                            + Panier
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ── DASHBOARD (UC1 + UC3) ── */
          <section style={DS.dashBg}>
            <div style={S.container}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontWeight: 900, fontSize: '1.8rem' }}>Dashboard Artisan</h1>
                  <p style={{ color: c.muted }}>Contrôlez et suivez votre production en temps réel.</p>
                </div>
                <button onClick={() => setTab('home')} style={{ background: 'none', border: `1px solid ${c.primary}`, color: c.primary, padding: '.5rem 1.2rem', borderRadius: 9999, cursor: 'pointer', fontWeight: 600 }}>← Accueil</button>
              </div>

              <div style={DS.layout}>
                {/* LEFT */}
                <div>
                  {/* UC3 — Contrôle Moulin */}
                  <div style={DS.card}>
                    <div style={DS.sectionHead}><Settings size={20} color={c.primary} /> Contrôle du Moulin</div>
                    <div style={DS.controlGrid}>
                      <button disabled={running} style={DS.btnLancer(running)} onClick={() => sendCommand('START')}>
                        <Play size={18} fill="currentColor" /> LANCER
                      </button>
                      <button disabled={!running} style={DS.btnFermer(running)} onClick={() => sendCommand('STOP')}>
                        <Square size={18} fill="currentColor" /> FERMER
                      </button>
                    </div>
                    {/* Produit actif */}
                    {selected && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', borderRadius: 14, padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={selected.image || maniocImg} alt={selected.nom} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{selected.nom}</div>
                            <div style={{ color: c.muted, fontSize: '.85rem' }}>Produit sélectionné</div>
                          </div>
                        </div>
                        <span style={{ background: '#E6F7ED', color: c.primary, padding: '.3rem .8rem', borderRadius: 9999, fontWeight: 700, fontSize: '.9rem' }}>{(selected.prix_kg || 0).toLocaleString()} FCFA/kg</span>
                      </div>
                    )}
                  </div>

                  {/* UC3 — Liste Produits dans Dashboard */}
                  <div style={DS.card}>
                    <div style={DS.sectionHead}><Package size={20} color={c.primary} /> Liste des Produits</div>
                    {products.map(p => (
                      <div key={p.id} onClick={() => setSelected(p)} style={selected?.id === p.id ? DS.productRowActive : DS.productRow}>
                        <img src={p.image || maniocImg} alt={p.nom} style={DS.productRowImg} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{p.nom}</div>
                          <div style={{ color: c.muted, fontSize: '.8rem' }}>Stock: {p.stock_kg || '—'} kg</div>
                        </div>
                        <div style={{ fontWeight: 700, color: c.primary, fontSize: '.95rem' }}>{(p.prix_kg || 0).toLocaleString()} FCFA</div>
                        {selected?.id === p.id && <CheckCircle size={18} color={c.primary} />}
                      </div>
                    ))}
                  </div>

                  {/* UC1 — Inventaire */}
                  <div style={DS.card}>
                    <div style={DS.sectionHead}><BarChart3 size={20} color={c.primary} /> Inventaire</div>
                    <div style={DS.tabContainer}>
                      {['jour', 'mois', 'annee'].map(p => (
                        <button key={p} style={DS.tab(invPeriod === p)} onClick={() => setInvPeriod(p)}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div style={DS.statRow}>
                      <div style={DS.statBox}>
                        <span style={DS.statNum}>{inv.kg.toLocaleString()}</span>
                        <span style={DS.statLabel}>Kg moulus</span>
                      </div>
                      <div style={DS.statBox}>
                        <span style={DS.statNum}>{inv.clients}</span>
                        <span style={DS.statLabel}>Clients</span>
                      </div>
                      <div style={DS.statBox}>
                        <span style={{ ...DS.statNum, fontSize: '1.1rem' }}>{inv.chiffre.toLocaleString()}</span>
                        <span style={DS.statLabel}>FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* UC1 — Gérer Prix */}
                  <div style={DS.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                      <div style={DS.sectionHead}><Edit2 size={20} color={c.primary} /> Gérer les Prix</div>
                      <button onClick={editingPrices ? savePrices : () => setEditingPrices(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: editingPrices ? c.primary : '#F1F5F9', color: editingPrices ? '#fff' : c.dark, border: 'none', padding: '.5rem 1rem', borderRadius: 9999, cursor: 'pointer', fontWeight: 600, fontSize: '.85rem' }}>
                        {editingPrices ? <><Save size={14} /> Enregistrer</> : <><Edit2 size={14} /> Modifier</>}
                      </button>
                    </div>
                    {products.map(p => (
                      <div key={p.id} style={DS.priceRow}>
                        <div style={{ fontWeight: 600 }}>{p.nom}</div>
                        {editingPrices
                          ? <input type="number" defaultValue={p.prix_kg} onChange={e => setEditedPrices(prev => ({ ...prev, [p.id]: e.target.value }))} style={DS.priceInput} />
                          : <span style={{ fontWeight: 700, color: c.primary }}>{(p.prix_kg || 0).toLocaleString()} FCFA/kg</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — MONITOR (UC1 ESP32 live) */}
                <div>
                  <div style={DS.monitor}>
                    <div style={DS.monGlow} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
                      <span style={{ opacity: .6, fontWeight: 500 }}>Monitor Live</span>
                      <div style={DS.statusBadge(running)}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: running ? '#22c55e' : '#ef4444', animation: running ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
                        {running ? 'PRODUCTION' : 'PAUSE'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <div style={{ fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', opacity: .4, fontWeight: 700, marginBottom: '.4rem' }}>Poids Mesuré</div>
                      <div>
                        <span style={DS.weightVal}>{liveKg.toFixed(3)}</span>
                        <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,.4)', marginLeft: '.4rem' }}>kg</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.7rem' }}>
                        <span style={{ opacity: .5 }}>Prix Total</span>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: c.primary }}>{(liveKg * (selected?.prix_kg || 1500)).toLocaleString()} FCFA</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.7rem' }}>
                        <span style={{ opacity: .5 }}>Produit</span>
                        <span style={{ fontWeight: 600 }}>{selected?.nom || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: .5 }}>Vitesse</span>
                        <span style={{ fontFamily: 'monospace' }}>{running ? '0.05 kg/s' : '0.00 kg/s'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,.05)', borderRadius: 14, padding: '.9rem 1rem', marginTop: '1.5rem' }}>
                      <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={18} color={c.primary} /></div>
                      <div>
                        <div style={{ fontSize: '.7rem', opacity: .35 }}>ESP32</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '.9rem' }}>192.168.4.1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <div style={S.container}>
          <div style={S.footerGrid}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
                <div style={{ ...S.logoIcon, width: 38, height: 38 }}>M</div>
                <span style={{ fontWeight: 800 }}>MayeleMoule 2.0</span>
              </div>
              <p style={S.footerMuted}>La technologie au service de votre mouture. Excellence, Qualité, Rapidité pour les artisans congolais.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {['FB', 'TW', 'IG'].map(s => <div key={s} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, color: '#9CA3AF' }}>{s}</div>)}
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Liens Rapides</h4>
              {['Accueil', 'Services', 'Produits', 'Offres', 'À Propos'].map(l => <a key={l} style={S.footerMuted}>{l}</a>)}
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Contact</h4>
              {['Kongo Central, RDC', '+243 821 000 000', 'contact@mayelemoule.cd'].map(c => <p key={c} style={S.footerMuted}>{c}</p>)}
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Newsletter</h4>
              <div style={{ display: 'flex' }}>
                <input placeholder="Votre email..." type="email" style={{ flex: 1, padding: '.75rem 1rem', background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: '12px 0 0 12px', color: '#fff', outline: 'none', fontSize: '.9rem' }} />
                <button style={{ padding: '.75rem 1rem', background: c.primary, border: 'none', borderRadius: '0 12px 12px 0', color: '#fff', cursor: 'pointer' }}><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
          <div style={S.footerBottom}>
            <span>© 2026 MayeleMoule 2.0. Tous droits réservés.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>{['Confidentialité', 'Conditions'].map(l => <a key={l} style={{ cursor: 'pointer' }}>{l}</a>)}</div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, system-ui, sans-serif; }
        a:hover { color: #00B14F !important; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
