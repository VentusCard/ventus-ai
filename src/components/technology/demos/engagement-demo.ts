export const engagementDemoHtml = `
<style>
  .vx-wrap{ max-width:1200px; margin:40px auto; padding:0 16px; }
  .vx-head{ margin-bottom:18px; }
  .vx-title{ font-size:18px; font-weight:650; letter-spacing:-0.02em; color:#0f172a; }
  .vx-sub{ margin-top:6px; font-size:13px; color:rgba(15,23,42,.55); max-width:920px; line-height:1.45; }

  .phone-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; align-items:start; }
  @media(max-width:980px){ .phone-row{ grid-template-columns:1fr; } }

  .phone{
    border:1px solid rgba(15,23,42,.12);
    border-radius:30px;
    background: rgba(15,23,42,.02);
    box-shadow:0 10px 40px rgba(0,0,0,.06);
    overflow:hidden;
    position:relative;
  }

  .statusbar{
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 14px 8px; font-size:12px; color:rgba(15,23,42,.55);
  }
  .status-right{ display:flex; gap:8px; opacity:.70; }
  .sig,.bat{ border:1px solid rgba(15,23,42,.15); background:rgba(15,23,42,.08); }
  .sig{ width:14px;height:10px;border-radius:2px; }
  .bat{ width:22px;height:10px;border-radius:2px; }

  .apphead{
    padding:10px 14px 12px;
    border-bottom:1px solid rgba(15,23,42,.08);
    background:rgba(15,23,42,.02);
  }
  .apphead-top{ display:flex; justify-content:space-between; align-items:center; gap:10px; }
  .app-title{ font-size:14px; font-weight:700; letter-spacing:-0.01em; color:#0f172a; }
  .app-chip{
    font-size:12px;padding:4px 8px;border-radius:999px;
    border:1px solid rgba(15,23,42,.15); background:rgba(15,23,42,.05);
    color:rgba(15,23,42,.70); white-space:nowrap;
  }
  .app-sub{ margin-top:6px;font-size:12px;color:rgba(15,23,42,.55); line-height:1.35; }

  .screen{
    height:640px;
    padding:12px 12px 64px;
    overflow:hidden;
    position:relative;
  }
  .screen::after{
    content:"";
    position:absolute; left:0; right:0; bottom:52px; height:36px;
    background:linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.8));
    pointer-events:none;
  }

  .bottomnav{
    position:absolute; left:0; right:0; bottom:0;
    border-top:1px solid rgba(15,23,42,.08);
    background:rgba(255,255,255,1);
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
    padding:10px 10px 12px;
    display:flex; justify-content:space-around; gap:8px;
    font-size:10px; color:rgba(15,23,42,.40);
  }
  .navitem{ display:flex; flex-direction:column; align-items:center; gap:4px; min-width:62px; }
  .navdot{ width:18px;height:18px;border:1px solid rgba(15,23,42,.12);border-radius:6px;background:rgba(15,23,42,.04); }
  .navitem.active{ color:rgba(15,23,42,.85); font-weight:650; }
  .navitem.active .navdot{ background:rgba(15,23,42,.10); }

  .block{
    border:1px solid rgba(15,23,42,.08);
    border-radius:16px;
    background:rgba(15,23,42,.02);
    padding:12px;
    margin-bottom:10px;
  }
  .block-title{ font-size:12px;font-weight:650;color:rgba(15,23,42,.50);margin-bottom:10px; }

  .pill-row{ display:flex; flex-wrap:wrap; gap:8px; }
  .pill{
    font-size:12px;padding:6px 10px;border-radius:999px;
    border:1px solid rgba(15,23,42,.12); background:rgba(15,23,42,.04);
    color:rgba(15,23,42,.75); white-space:nowrap;
  }

  .row2{
    display:flex; justify-content:space-between; align-items:flex-start; gap:10px;
    font-size:12px; color:rgba(15,23,42,.60);
  }
  .row2 strong{ font-weight:650; color:rgba(15,23,42,.85); }
  .row2 + .row2{ margin-top:8px; }
  .right{ text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }

  .card{
    padding:10px;
    border:1px solid rgba(15,23,42,.08);
    border-radius:14px;
    background:rgba(15,23,42,.02);
    margin-bottom:8px;
  }
  .card:last-child{ margin-bottom:0; }
  .card-title{ font-size:13px; font-weight:650; color:#0f172a; }
  .card-sub{ margin-top:2px; font-size:12px; color:rgba(15,23,42,.55); line-height:1.35; }

  .toggle{
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    padding:10px;
    border:1px solid rgba(15,23,42,.08);
    border-radius:14px;
    background:rgba(15,23,42,.02);
  }
  .toggle-left{ min-width:0; }
  .toggle-title{ font-size:13px; font-weight:650; color:#0f172a; }
  .toggle-sub{ margin-top:2px; font-size:12px; color:rgba(15,23,42,.55); line-height:1.35; }
  .switch{
    width:40px; height:22px; border-radius:999px;
    border:1px solid rgba(15,23,42,.15);
    background:rgba(15,23,42,.06);
    position:relative; flex:0 0 auto;
  }
  .switch::after{
    content:"";
    position:absolute; top:2px; left:2px;
    width:18px; height:18px;
    border-radius:999px;
    background:rgba(15,23,42,.15);
    transition:transform .22s ease;
  }
  .switch.on{ background:rgba(59,130,246,.15); }
  .switch.on::after{ transform:translateX(18px); background:rgba(59,130,246,.65); }

  .deal{
    padding:10px 0;
    border-top:1px solid rgba(15,23,42,.08);
  }
  .deal:first-child{ border-top:none; padding-top:0; }
  .deal-merchant{ font-size:13px; font-weight:650; color:#0f172a; }
  .deal-msg{ margin-top:2px; font-size:12px; color:rgba(15,23,42,.55); line-height:1.35; }
  .deal-meta{ margin-top:6px; display:flex; justify-content:space-between; gap:10px; font-size:11px; color:rgba(15,23,42,.40); }
  .deal-meta span{ white-space:nowrap; }

  .geo-head{
    padding:10px;
    border:1px solid rgba(15,23,42,.08);
    border-radius:14px;
    background:rgba(15,23,42,.02);
    margin-bottom:10px;
  }
  .geo-city{ font-size:13px; font-weight:650; color:#0f172a; }
  .geo-sub{ margin-top:2px; font-size:12px; color:rgba(15,23,42,.55); }

  .cta-btn{
    margin-top:8px;padding:8px;
    background:rgba(15,23,42,.06);
    border:1px solid rgba(15,23,42,.12);
    border-radius:8px;text-align:center;
    font-size:12px;font-weight:600;
    color:rgba(15,23,42,.80);
  }
  .cta-btn-blue{
    margin-top:8px;padding:8px;
    background:rgba(59,130,246,.08);
    border:1px solid rgba(59,130,246,.18);
    border-radius:8px;text-align:center;
    font-size:12px;font-weight:600;
    color:rgba(59,130,246,.85);
  }

  .badge-green{
    background:rgba(34,197,94,.10);
    color:rgba(22,163,74,.85);
    padding:3px 7px;border-radius:6px;
    font-size:9px;font-weight:650;white-space:nowrap;margin-left:8px;
  }
  .badge-orange{
    background:rgba(245,158,11,.10);
    color:rgba(217,119,6,.85);
    padding:3px 7px;border-radius:6px;
    font-size:10px;font-weight:650;white-space:nowrap;margin-left:8px;
  }
  .badge-new{
    background:rgba(59,130,246,.10);
    color:rgba(37,99,235,.85);
    padding:3px 7px;border-radius:6px;
    font-size:10px;font-weight:650;white-space:nowrap;margin-left:8px;
  }

  .tile-travel{ background:rgba(255,140,80,.12); border-radius:12px;padding:10px;min-height:90px; }
  .tile-dining{ background:rgba(255,80,80,.12); border-radius:12px;padding:10px;min-height:90px; }
  .tile-pets  { background:rgba(80,190,240,.12); border-radius:12px;padding:10px;min-height:90px; }
  .tile-well  { background:rgba(80,200,160,.12); border-radius:12px;padding:10px;min-height:90px; }
  .tile-label { font-size:13px;font-weight:650;margin-bottom:3px;color:#0f172a; }
  .tile-copy  { font-size:11px;line-height:1.2;color:rgba(15,23,42,.65); }

  .setting-row{
    padding:10px 12px;
    border-bottom:1px solid rgba(15,23,42,.08);
    display:flex;justify-content:space-between;align-items:center;
    font-size:12px;color:rgba(15,23,42,.75);
  }
  .setting-row:last-child{ border-bottom:none; }
  .setting-caret{ color:rgba(15,23,42,.35); }

  .partner-badge{
    padding:6px 12px;border:1px solid rgba(15,23,42,.12);border-radius:8px;
    font-size:10px;font-weight:600;background:rgba(15,23,42,.03);
    color:rgba(15,23,42,.60);
  }

  .benefit-row{
    padding:10px 0;
    border-top:1px solid rgba(15,23,42,.08);
    display:flex;justify-content:space-between;align-items:center;
  }

  .hero-deal{
    background:linear-gradient(135deg, rgba(220,80,80,.55) 0%, rgba(180,60,60,.65) 100%);
    border:1px solid rgba(220,80,80,.25);
    color:#fff;padding:14px;border-radius:16px;margin-bottom:12px;
  }
  .hero-cta{
    background:rgba(255,255,255,.25);
    border:1px solid rgba(255,255,255,.35);
    color:#fff;padding:10px;border-radius:10px;
    text-align:center;font-size:13px;font-weight:700;margin-top:10px;
  }

  .member-card{
    background:linear-gradient(135deg, rgba(212,175,55,.50) 0%, rgba(180,148,35,.60) 100%);
    border:1px solid rgba(212,175,55,.30);
    color:#fff;padding:14px;border-radius:16px;margin-bottom:12px;
  }

  .profile-card{
    background:linear-gradient(135deg, rgba(0,100,180,.50) 0%, rgba(0,60,120,.60) 100%);
    border:1px solid rgba(0,100,180,.25);
    color:#fff;border-radius:16px;padding:14px;margin-bottom:10px;
  }

  #locationContext, #availableNow{
    transition: opacity .28s ease;
  }

  .fade-in{ opacity:0; transform:translateY(8px); animation:fadeIn .70s ease forwards; }
  .d2{ animation-delay:.14s; }
  .d3{ animation-delay:.28s; }
  @keyframes fadeIn{ to{ opacity:1; transform:translateY(0); } }
</style>

<div class="vx-wrap">
  <div class="vx-head">
    <div class="vx-title">Personalized Banking Experience</div>
    <div class="vx-sub">
      A profile-centric experience where transaction intelligence organizes lifestyle pillars, curates deals, and adapts discovery by travel and location — in a bank-agnostic way.
    </div>
  </div>

  <div class="phone-row">

    <!-- PHONE 1: PROFILE -->
    <div class="phone fade-in">
      <div class="statusbar" aria-hidden="true">
        <div>9:41</div>
        <div class="status-right"><div class="sig"></div><div class="bat"></div></div>
      </div>

      <div class="apphead">
        <div class="apphead-top">
          <div class="app-title">My Profile</div>
          <div class="app-chip">Ventus</div>
        </div>
        <div class="app-sub">Your personalized banking experience.</div>
      </div>

      <div class="screen">
        <div style="padding:12px 14px 8px;border-bottom:1px solid rgba(15,23,42,.08);">
          <div style="font-size:15px;font-weight:400;margin-bottom:6px;color:#0f172a;">Good morning</div>
          <div style="font-size:12px;color:rgba(15,23,42,.55);line-height:1.3;">
            You've saved \$325 this quarter through personalized rewards.
          </div>
        </div>

        <div style="padding:10px 14px 12px;">
          <div class="profile-card">
            <div style="font-size:10px;margin-bottom:3px;opacity:0.80;">Your Lifestyle Profile</div>
            <div style="font-size:18px;font-weight:700;margin-bottom:4px;letter-spacing:-0.3px;">WELLNESS EXPLORER</div>
            <div style="font-size:11px;line-height:1.3;opacity:0.85;">You balanced fitness, healthy dining, and travel this quarter.</div>
          </div>

          <div class="block-title" style="margin-bottom:8px;">LIFESTYLE OVERVIEW</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:10px;">
            <div class="tile-travel"><div class="tile-label">Travel</div><div class="tile-copy">3 new cities visited across 2 countries</div></div>
            <div class="tile-dining"><div class="tile-label">Dining</div><div class="tile-copy">5 new restaurants tried, mostly Italian &amp; Asian</div></div>
            <div class="tile-pets"><div class="tile-label">Pets</div><div class="tile-copy">Your dog got pampered at 2 grooming shops</div></div>
            <div class="tile-well"><div class="tile-label">Wellness</div><div class="tile-copy">4 fitness classes booked, 12 gym visits</div></div>
          </div>

          <div class="block-title" style="margin-bottom:8px;">REWARDS &amp; DISCOVERY</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:10px;">
            <div class="card"><div class="card-title" style="font-size:12px;">1 purchase away</div><div class="card-sub" style="font-size:11px;">from your Travel Perk</div></div>
            <div class="card"><div class="card-title" style="font-size:12px;">Spa Package Sale</div><div class="card-sub" style="font-size:11px;">20% off local wellness centers</div></div>
            <div class="card"><div class="card-title" style="font-size:12px;">Your Fall Lifestyle Pack</div><div class="card-sub" style="font-size:11px;">Seasonal rewards unlocked</div></div>
            <div class="card"><div class="card-title" style="font-size:12px;">Explore Other Products</div><div class="card-sub" style="font-size:11px;">Exclusive Offers For You</div></div>
          </div>

          <div class="block-title" style="margin-bottom:8px;">SETTINGS</div>
          <div class="block" style="padding:0;overflow:hidden;">
            <div class="setting-row"><span>Profile Setting</span><span class="setting-caret">›</span></div>
            <div class="setting-row"><span>Notification Settings</span><span class="setting-caret">›</span></div>
            <div class="setting-row"><span>Rewards and Perks</span><span class="setting-caret">›</span></div>
            <div class="setting-row"><span>Privacy and Data</span><span class="setting-caret">›</span></div>
          </div>
        </div>

        <div class="bottomnav" aria-hidden="true">
          <div class="navitem active"><div class="navdot"></div><div>Profile</div></div>
          <div class="navitem"><div class="navdot"></div><div>Deals</div></div>
          <div class="navitem"><div class="navdot"></div><div>Perks</div></div>
          <div class="navitem"><div class="navdot"></div><div>Support</div></div>
        </div>
      </div>
    </div>

    <!-- PHONE 2: DEALS -->
    <div class="phone fade-in d2">
      <div class="statusbar" aria-hidden="true">
        <div>9:41</div>
        <div class="status-right"><div class="sig"></div><div class="bat"></div></div>
      </div>

      <div class="apphead">
        <div class="apphead-top">
          <div class="app-title">Offers</div>
          <div class="app-chip">For You</div>
        </div>
        <div class="app-sub">Deals and cashback picked just for you.</div>
      </div>

      <div class="screen">
        <div class="hero-deal">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div style="flex:1;">
              <div style="font-size:11px;opacity:0.80;margin-bottom:3px;">FEATURED OFFER</div>
              <div style="font-size:16px;font-weight:700;margin-bottom:4px;">REI Co-op</div>
              <div style="font-size:13px;line-height:1.3;opacity:0.90;">Get 10% back on outdoor gear and winter equipment</div>
            </div>
            <div style="background:rgba(15,23,42,.06);border:1px solid rgba(15,23,42,.12);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:650;white-space:nowrap;margin-left:8px;color:rgba(15,23,42,.70);">Expires Jan 15</div>
          </div>
          <div class="hero-cta">Activate Offer</div>
        </div>

        <div class="block" style="padding:8px;margin-bottom:10px;">
          <div style="display:flex;gap:8px;flex-wrap:nowrap;">
            <div class="pill" style="background:rgba(15,23,42,.08);border-color:rgba(15,23,42,.18);font-weight:600;flex-shrink:0;">🏔️ Outdoor</div>
            <div class="pill" style="flex-shrink:0;">🍽️ Dining</div>
            <div class="pill" style="flex-shrink:0;">🛍️ Shopping</div>
            <div class="pill" style="flex-shrink:0;">💪 Wellness</div>
          </div>
        </div>

        <div class="block">
          <div class="block-title">Available Offers</div>

          <div class="deal">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
              <div style="flex:1;">
                <div class="deal-merchant">Smith Optics</div>
                <div class="deal-msg">Save \$40 on helmets and goggles</div>
              </div>
              <div class="badge-new">New</div>
            </div>
            <div class="cta-btn">Activate</div>
          </div>

          <div class="deal">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
              <div style="flex:1;">
                <div class="deal-merchant">GoPro</div>
                <div class="deal-msg">Earn 15% back on cameras and accessories</div>
              </div>
              <div class="badge-orange">Ending Soon</div>
            </div>
            <div class="cta-btn">Activate</div>
          </div>

          <div class="deal">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
              <div style="flex:1;">
                <div class="deal-merchant">Patagonia</div>
                <div class="deal-msg">Get 5% cashback on sustainable outdoor wear</div>
              </div>
            </div>
            <div class="cta-btn">Activate</div>
          </div>
        </div>

        <div class="block">
          <div class="block-title">Near You</div>
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div class="card-title" style="font-size:13px;">Mountain Sports</div>
                <div class="card-sub" style="font-size:11px;">20% off ski tuning services · 0.8 mi away</div>
              </div>
               <div style="font-size:11px;color:rgba(15,23,42,.40);white-space:nowrap;margin-left:8px;">View</div>
            </div>
          </div>
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div class="card-title" style="font-size:13px;">Summit Coffee</div>
                <div class="card-sub" style="font-size:11px;">Buy 2 get 1 free · 1.2 mi away</div>
              </div>
              <div style="font-size:11px;color:rgba(15,23,42,.40);white-space:nowrap;margin-left:8px;">View</div>
            </div>
          </div>
        </div>

        <div class="block" style="padding:12px;text-align:center;">
          <div style="font-size:12px;color:rgba(15,23,42,.55);margin-bottom:4px;">Saved Offers</div>
          <div style="font-size:11px;color:rgba(15,23,42,.40);">Tap the bookmark icon to save offers for later</div>
        </div>

        <div class="bottomnav" aria-hidden="true">
          <div class="navitem"><div class="navdot"></div><div>Profile</div></div>
          <div class="navitem active"><div class="navdot"></div><div>Deals</div></div>
          <div class="navitem"><div class="navdot"></div><div>Perks</div></div>
          <div class="navitem"><div class="navdot"></div><div>Support</div></div>
        </div>
      </div>
    </div>

    <!-- PHONE 3: PERKS -->
    <div class="phone fade-in d3">
      <div class="statusbar" aria-hidden="true">
        <div>9:41</div>
        <div class="status-right"><div class="sig"></div><div class="bat"></div></div>
      </div>

      <div class="apphead">
        <div class="apphead-top">
          <div class="app-title">Perks</div>
          <div class="app-chip">Premium</div>
        </div>
        <div class="app-sub">Your membership benefits and exclusive access.</div>
      </div>

      <div class="screen">
        <div class="member-card">
          <div style="font-size:11px;opacity:0.80;margin-bottom:3px;">YOUR MEMBERSHIP</div>
          <div style="font-size:18px;font-weight:700;margin-bottom:6px;letter-spacing:-0.3px;">PREMIUM BANKING</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.25);">
            <div>
              <div style="font-size:10px;opacity:0.75;margin-bottom:2px;">Perks Used</div>
              <div style="font-size:16px;font-weight:700;">12 this quarter</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px;opacity:0.75;margin-bottom:2px;">You've Saved</div>
              <div style="font-size:16px;font-weight:700;">\$325 this year</div>
            </div>
          </div>
        </div>

        <div style="padding:0 12px 8px;font-size:11px;color:rgba(15,23,42,.55);" id="locationContext">
          📍 Currently in New York City
        </div>

        <div class="block" id="availableNow">
          <div class="block-title">Available Now</div>

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
              <div style="flex:1;">
                <div class="card-title">🎭 Free Museum Admission</div>
                <div class="card-sub">Metropolitan Museum of Art, MoMA, Natural History</div>
              </div>
              <div class="badge-green">Active</div>
            </div>
            <div class="cta-btn-blue">View Details</div>
          </div>

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
              <div style="flex:1;">
                <div class="card-title">🍽️ Priority Dining</div>
                <div class="card-sub">Reserve exclusive tables at 200+ NYC restaurants</div>
              </div>
            </div>
            <div class="cta-btn-blue">Make Reservation</div>
          </div>

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
              <div style="flex:1;">
                <div class="card-title">✈️ Airport Lounge Access</div>
                <div class="card-sub">Complimentary entry at JFK, LGA, EWR lounges</div>
              </div>
            </div>
            <div class="cta-btn-blue">Show Pass</div>
          </div>
        </div>

        <div class="block">
          <div class="block-title">All Your Benefits</div>

          <div class="benefit-row">
            <div>
               <div style="font-size:13px;font-weight:650;color:#0f172a;">💳 Cashback Rewards</div>
              <div style="font-size:11px;color:rgba(15,23,42,.55);margin-top:2px;">3% on dining, 2% on travel</div>
            </div>
            <div style="color:rgba(15,23,42,.35);">›</div>
          </div>

          <div class="benefit-row">
            <div>
               <div style="font-size:13px;font-weight:650;color:#0f172a;">🏨 Hotel Benefits</div>
              <div style="font-size:11px;color:rgba(15,23,42,.55);margin-top:2px;">Room upgrades, late checkout, breakfast</div>
            </div>
            <div style="color:rgba(15,23,42,.35);">›</div>
          </div>

          <div class="benefit-row">
            <div>
               <div style="font-size:13px;font-weight:650;color:#0f172a;">🎫 Entertainment Access</div>
              <div style="font-size:11px;color:rgba(15,23,42,.55);margin-top:2px;">Presale tickets, VIP seating, backstage passes</div>
            </div>
            <div style="color:rgba(15,23,42,.35);">›</div>
          </div>

          <div class="benefit-row">
            <div>
               <div style="font-size:13px;font-weight:650;color:#0f172a;">🛡️ Travel Protection</div>
              <div style="font-size:11px;color:rgba(15,23,42,.55);margin-top:2px;">Trip insurance, baggage coverage, rental car</div>
            </div>
            <div style="color:rgba(15,23,42,.35);">›</div>
          </div>

          <div class="benefit-row" style="border-bottom:1px solid rgba(15,23,42,.08);padding-bottom:10px;">
            <div>
              <div style="font-size:13px;font-weight:650;color:#0f172a;">💪 Wellness &amp; Lifestyle</div>
              <div style="font-size:11px;color:rgba(15,23,42,.55);margin-top:2px;">Gym discounts, spa access, fitness classes</div>
            </div>
            <div style="color:rgba(15,23,42,.35);">›</div>
          </div>
        </div>

        <div class="block" style="text-align:center;padding:12px;">
          <div style="font-size:11px;color:rgba(15,23,42,.55);margin-bottom:8px;">PARTNER NETWORK</div>
          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
            <div class="partner-badge">Priority Pass</div>
            <div class="partner-badge">Visa Infinite</div>
            <div class="partner-badge">Luxury Hotels</div>
          </div>
        </div>

        <div class="bottomnav" aria-hidden="true">
          <div class="navitem"><div class="navdot"></div><div>Profile</div></div>
          <div class="navitem"><div class="navdot"></div><div>Deals</div></div>
          <div class="navitem active"><div class="navdot"></div><div>Travel</div></div>
          <div class="navitem"><div class="navdot"></div><div>Support</div></div>
        </div>
      </div>
    </div>

  </div>
</div>

<script>
(function(){
  var LOCATIONS = [
    {
      city:"New York City",
      context:"📍 Currently in New York City",
      benefits:[
        { icon:"🎭", title:"Free Museum Admission", desc:"Metropolitan Museum of Art, MoMA, Natural History", cta:"View Details", badge:"Active" },
        { icon:"🍽️", title:"Priority Dining", desc:"Reserve exclusive tables at 200+ NYC restaurants", cta:"Make Reservation" },
        { icon:"✈️", title:"Airport Lounge Access", desc:"Complimentary entry at JFK, LGA, EWR lounges", cta:"Show Pass" }
      ]
    },
    {
      city:"San Francisco",
      context:"📍 Currently in San Francisco",
      benefits:[
        { icon:"🎭", title:"Free Museum Entry", desc:"California Academy of Sciences, de Young, SFMOMA", cta:"View Details", badge:"Active" },
        { icon:"🍽️", title:"Dining Experiences", desc:"Priority seating at Ferry Building & Union Square", cta:"Make Reservation" },
        { icon:"✈️", title:"SFO Lounge Access", desc:"Complimentary access to all SFO premium lounges", cta:"Show Pass" }
      ]
    },
    {
      city:"Los Angeles",
      context:"📍 Currently in Los Angeles",
      benefits:[
        { icon:"🎭", title:"Arts & Culture Access", desc:"Getty Center, LACMA, Broad Museum free admission", cta:"View Details", badge:"Active" },
        { icon:"🎫", title:"Entertainment Perks", desc:"Priority tickets to Hollywood Bowl & music venues", cta:"Browse Events" },
        { icon:"✈️", title:"LAX Lounge Access", desc:"Premium lounge entry at all LAX terminals", cta:"Show Pass" }
      ]
    }
  ];

  var i = 0;
  var contextEl = document.getElementById("locationContext");
  var availableEl = document.getElementById("availableNow");

  function esc(s){
    return String(s)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function render(){
    var d = LOCATIONS[i];

    contextEl.style.opacity = "0";
    availableEl.style.opacity = "0";

    setTimeout(function() {
      contextEl.textContent = d.context;

      availableEl.innerHTML =
        '<div class="block-title">Available Now</div>' +
        d.benefits.map(function(b) { return '<div class="card">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">' +
              '<div style="flex:1;">' +
                '<div class="card-title">' + esc(b.icon) + ' ' + esc(b.title) + '</div>' +
                '<div class="card-sub">' + esc(b.desc) + '</div>' +
              '</div>' +
              (b.badge ? '<div class="badge-green">' + esc(b.badge) + '</div>' : '') +
            '</div>' +
            '<div class="cta-btn-blue">' + esc(b.cta) + '</div>' +
          '</div>'; }).join("");

      contextEl.style.opacity = "1";
      availableEl.style.opacity = "1";

      i = (i + 1) % LOCATIONS.length;
    }, 220);
  }

  render();
  setInterval(render, 4800);
})();
</script>
`;
