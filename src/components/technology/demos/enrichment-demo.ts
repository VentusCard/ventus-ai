export const enrichmentDemoHtml = `<div id="ventus-te-enterprise">
  <style>
    #ventus-te-enterprise{
      --ink:#ffffff;
      --muted:rgba(255,255,255,.62);
      --hair:rgba(255,255,255,.20);
      --wash:rgba(255,255,255,.05);
      --radius:18px;
      --sigBg: rgba(255,255,255,.08);
      --sigBd: rgba(255,255,255,.20);
      --sigInk: rgba(255,255,255,.90);
      --hlBg: rgba(255,255,255,.04);
      --hlBd: rgba(255,255,255,.16);
    }

    #ventus-te-enterprise, #ventus-te-enterprise *{ box-sizing:border-box; }
    #ventus-te-enterprise{
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      color: var(--ink);
      max-width: 1120px;
      margin: 0 auto;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .vte-card{
      border:1px solid var(--hair);
      border-radius: var(--radius);
      overflow:hidden;
      background: transparent;
    }

    .vte-head{
      padding: 16px 18px;
      border-bottom: 1px solid var(--hair);
      background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0));
      display:flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }
    .vte-title{
      margin:0;
      font-size: 15px;
      font-weight: 820;
      letter-spacing: -0.01em;
    }

    .vte-table{ width:100%; }
    .vte-row{
      display:grid;
      grid-template-columns:
        minmax(280px, 2.3fr)
        minmax(85px, .6fr)
        minmax(74px, .55fr)
        minmax(170px, 1.15fr)
        minmax(170px, 1.15fr)
        minmax(170px, 1.15fr);
    }
    .vte-row.head{
      background: var(--wash);
      font-size: 12px;
      font-weight: 780;
      letter-spacing: -0.01em;
    }
    .vte-cell{
      padding: 12px 16px;
      border-bottom: 1px solid var(--hair);
      border-right: 1px solid var(--hair);
      font-size: 13px;
      display:flex;
      align-items:center;
      min-height: 50px;
    }
    .vte-row .vte-cell:last-child{ border-right:none; }

    .vte-cell.derived{
      opacity: 0;
      animation: vte-fadeIn 0.6s ease-in-out 0.75s forwards;
    }

    @keyframes vte-fadeIn{
      from{ opacity: 0; transform: translateY(4px); }
      to{ opacity: 1; transform: translateY(0); }
    }

    .vte-row.data-row{
      animation: vte-slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes vte-slideIn{
      from{ opacity: 0; transform: translateY(-12px); }
      to{ opacity: 1; transform: translateY(0); }
    }

    .raw{ white-space: normal; word-break: break-word; line-height: 1.25; }
    .one{ white-space: nowrap; line-height: 1.2; }
    .derived-text{ color: rgba(255,255,255,.80); font-weight: 650; }

    .vte-spacer{ height: 12px; }

    .vte-disclaimer{ margin-top: 16px; text-align: center; }
    .vte-disclaimer p{
      margin: 0; font-size: 11px; color: rgba(255,255,255,.42);
      font-weight: 620; letter-spacing: -0.005em; line-height: 1.4;
    }

    .persona-wrap{ padding: 16px 18px 18px; }
    .persona-panel{
      border: 1px solid var(--hlBd);
      background: var(--hlBg);
      border-radius: 16px;
      padding: 14px 14px;
      display:flex;
      flex-direction: column;
      gap: 12px;
    }

    .persona-summary{
      margin: 0;
      font-family: ui-serif, Georgia, "Times New Roman", Times, serif;
      font-size: 18px;
      font-weight: 820;
      letter-spacing: -0.012em;
      line-height: 1.2;
    }
    .persona-summary .key{ font-weight: 920; }

    .signal-top{
      display:flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,.12);
    }
    .signal-label{
      font-size: 12px;
      font-weight: 820;
      color: rgba(255,255,255,.82);
      letter-spacing: -0.01em;
    }

    .chips{
      display:flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-start;
      align-content: flex-start;
    }
    .chip{
      display:inline-flex;
      align-items:center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 999px;
      border: 1px solid var(--sigBd);
      background: var(--sigBg);
      color: var(--sigInk);
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
    }
    .chip strong{ font-weight: 880; letter-spacing: -0.01em; }
    .chip .count{ font-weight: 820; color: rgba(255,255,255,.70); }

    .chip.is-off{
      opacity: .42;
      background: rgba(255,255,255,.02);
      border-color: rgba(255,255,255,.12);
    }
    .chip.is-off .count{ display:none; }

    @media (max-width: 980px){
      .vte-row{ grid-template-columns: 1fr; }
      .vte-row.head{ display:none; }
      .vte-cell{
        border-right:none;
        display:grid;
        grid-template-columns: 150px 1fr;
        gap: 10px;
        align-items:start;
        min-height: auto;
      }
      .vte-cell::before{
        content: attr(data-label);
        color: var(--muted);
        font-weight: 650;
        font-size: 12px;
      }
      .persona-summary{ font-size: 17px; }
    }
  </style>

  <div class="vte-card">
    <div class="vte-head">
      <h3 class="vte-title">Transaction Enrichment</h3>
    </div>

    <div class="vte-table">
      <div class="vte-row head">
        <div class="vte-cell">Raw Transaction</div>
        <div class="vte-cell">Amount</div>
        <div class="vte-cell">MCC</div>
        <div class="vte-cell">Merchant</div>
        <div class="vte-cell">Category</div>
        <div class="vte-cell">Sub-Category</div>
      </div>

      <div class="vte-row data-row" style="animation-delay:0.1s">
        <div class="vte-cell raw" data-label="Raw Transaction">WHOLEFDS MKT #10847 AUSTIN TX</div>
        <div class="vte-cell one" data-label="Amount">$127.43</div>
        <div class="vte-cell one" data-label="MCC">5411</div>
        <div class="vte-cell one derived" data-label="Merchant"><span class="derived-text">Whole Foods Market</span></div>
        <div class="vte-cell one derived" data-label="Category"><span class="derived-text">Groceries</span></div>
        <div class="vte-cell one derived" data-label="Sub-Category"><span class="derived-text">Organic & Specialty</span></div>
      </div>

      <div class="vte-row data-row" style="animation-delay:0.25s">
        <div class="vte-cell raw" data-label="Raw Transaction">UBER *EATS PENDING SF CA</div>
        <div class="vte-cell one" data-label="Amount">$34.50</div>
        <div class="vte-cell one" data-label="MCC">5812</div>
        <div class="vte-cell one derived" data-label="Merchant"><span class="derived-text">Uber Eats</span></div>
        <div class="vte-cell one derived" data-label="Category"><span class="derived-text">Food & Dining</span></div>
        <div class="vte-cell one derived" data-label="Sub-Category"><span class="derived-text">Delivery</span></div>
      </div>

      <div class="vte-row data-row" style="animation-delay:0.4s">
        <div class="vte-cell raw" data-label="Raw Transaction">AMZN MKTP US*2K7RQ1FW0</div>
        <div class="vte-cell one" data-label="Amount">$89.99</div>
        <div class="vte-cell one" data-label="MCC">5942</div>
        <div class="vte-cell one derived" data-label="Merchant"><span class="derived-text">Amazon</span></div>
        <div class="vte-cell one derived" data-label="Category"><span class="derived-text">Shopping</span></div>
        <div class="vte-cell one derived" data-label="Sub-Category"><span class="derived-text">Online Marketplace</span></div>
      </div>

      <div class="vte-row data-row" style="animation-delay:0.55s">
        <div class="vte-cell raw" data-label="Raw Transaction">SQ *BLUE BOTTLE COFFE SAN FRANCISCO</div>
        <div class="vte-cell one" data-label="Amount">$6.75</div>
        <div class="vte-cell one" data-label="MCC">5814</div>
        <div class="vte-cell one derived" data-label="Merchant"><span class="derived-text">Blue Bottle Coffee</span></div>
        <div class="vte-cell one derived" data-label="Category"><span class="derived-text">Food & Dining</span></div>
        <div class="vte-cell one derived" data-label="Sub-Category"><span class="derived-text">Coffee & Tea</span></div>
      </div>

      <div class="vte-row data-row" style="animation-delay:0.7s">
        <div class="vte-cell raw" data-label="Raw Transaction">NETFLIX.COM 866-579-7172 CA</div>
        <div class="vte-cell one" data-label="Amount">$15.49</div>
        <div class="vte-cell one" data-label="MCC">4899</div>
        <div class="vte-cell one derived" data-label="Merchant"><span class="derived-text">Netflix</span></div>
        <div class="vte-cell one derived" data-label="Category"><span class="derived-text">Entertainment</span></div>
        <div class="vte-cell one derived" data-label="Sub-Category"><span class="derived-text">Streaming</span></div>
      </div>
    </div>
  </div>

  <div class="vte-spacer"></div>

  <div class="vte-card">
    <div class="vte-head">
      <h3 class="vte-title">Customer Persona</h3>
    </div>

    <div class="persona-wrap">
      <div class="persona-panel">
        <p class="persona-summary">
          <span class="key">Urban Professional</span> · Health-conscious, tech-savvy consumer with premium brand affinity and subscription-based lifestyle.
        </p>

        <div class="signal-top">
          <span class="signal-label">Signals</span>
          <div class="chips">
            <span class="chip"><strong>🥑 Organic Shopper</strong> <span class="count">12×</span></span>
            <span class="chip"><strong>📱 Digital-First</strong> <span class="count">8×</span></span>
            <span class="chip"><strong>☕ Coffee Enthusiast</strong> <span class="count">15×</span></span>
            <span class="chip"><strong>🎬 Entertainment Sub</strong> <span class="count">3×</span></span>
            <span class="chip"><strong>🏙️ Urban Lifestyle</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="vte-disclaimer">
    <p>Example merchants and MCC codes shown for demonstration purposes. Actual merchant names and codes may differ.</p>
  </div>

  <script>
    (function(){
      var root = document.getElementById('ventus-te-enterprise');
      if (!root) return;
      var delays = ['0.1s','0.25s','0.4s','0.55s','0.7s'];
      function replay(){
        var rows = root.querySelectorAll('.data-row');
        var derived = root.querySelectorAll('.vte-cell.derived');
        rows.forEach(function(r){ r.style.animation='none'; r.style.opacity='0'; });
        derived.forEach(function(d){ d.style.animation='none'; d.style.opacity='0'; });
        void root.offsetHeight;
        rows.forEach(function(r,i){
          r.style.animation='';
          r.style.opacity='';
          r.style.animationDelay=delays[i]||'0s';
        });
        derived.forEach(function(d){
          d.style.animation='';
          d.style.opacity='';
        });
      }
      setInterval(replay, 6000);
    })();
  </script>
</div>`;
