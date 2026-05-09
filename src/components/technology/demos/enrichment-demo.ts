export const enrichmentDemoHtml = `<div id="ventus-te-enterprise">
  <style>
    #ventus-te-enterprise{
      --ink:#0f172a;
      --muted:rgba(15,23,42,.55);
      --hair:rgba(15,23,42,.12);
      --wash:rgba(15,23,42,.04);
      --radius:18px;
      --sigBg: rgba(15,23,42,.05);
      --sigBd: rgba(15,23,42,.18);
      --sigInk: rgba(15,23,42,.88);
      --hlBg: rgba(15,23,42,.03);
      --hlBd: rgba(15,23,42,.12);
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
      background: linear-gradient(180deg, rgba(15,23,42,.03), rgba(15,23,42,0));
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

    .vte-row.data-row{
      opacity: 0;
      transform: translateY(-12px);
      transition: opacity 0.45s ease, transform 0.45s ease;
    }
    .vte-row.data-row.visible{
      opacity: 1;
      transform: translateY(0);
    }

    .vte-cell.derived span{
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
    }
    .vte-cell.derived.revealed span{
      opacity: 1;
      transform: translateY(0);
    }

    .raw{ white-space: normal; word-break: break-word; line-height: 1.25; }
    .one{ white-space: nowrap; line-height: 1.2; }
    .derived-text{ color: rgba(15,23,42,.70); font-weight: 650; }

    .vte-spacer{ height: 12px; }

    .vte-disclaimer{ margin-top: 16px; text-align: center; }
    .vte-disclaimer p{
      margin: 0; font-size: 11px; color: rgba(15,23,42,.42);
      font-weight: 620; letter-spacing: -0.005em; line-height: 1.4;
    }

    .persona-wrap{
      padding: 16px 18px 18px;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    .persona-wrap.visible{ opacity: 1; }
    .persona-wrap.updating{
      opacity: 0.3;
      transition: opacity 0.15s ease;
    }

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
    .persona-summary .key{ font-weight: 920; color: #0f172a; }

    .signal-top{
      display:flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 10px;
      border-top: 1px solid rgba(15,23,42,.10);
    }
    .signal-label{
      font-size: 12px;
      font-weight: 820;
      color: rgba(15,23,42,.65);
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
    .chip strong{ font-weight: 880; letter-spacing: -0.01em; color: #0f172a; }
    .chip .count{ font-weight: 820; color: rgba(15,23,42,.55); }

    /* fade-out state for the whole demo */
    .vte-fade-out .vte-row.data-row,
    .vte-fade-out .persona-wrap{
      opacity: 0 !important;
      transition: opacity 0.4s ease !important;
    }

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
      <h3 class="vte-title">Multi-rail Enrichment</h3>
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
      <div id="vte-tbody"></div>
    </div>
  </div>

  <div class="vte-spacer"></div>

  <div class="vte-card">
    <div class="vte-head">
      <h3 class="vte-title">Customer Persona</h3>
    </div>
    <div class="persona-wrap" id="vte-persona"></div>
  </div>


  <script>
    (function(){
      var root = document.getElementById('ventus-te-enterprise');
      if (!root) return;

      var datasets = [
        {
          rows: [
            {raw:'WHOLEFDS MKT #10847 AUSTIN TX', amt:'$127.43', mcc:'5411', merchant:'Whole Foods Market', cat:'Groceries', sub:'Organic & Specialty'},
            {raw:'UBER *EATS PENDING SF CA', amt:'$34.50', mcc:'5812', merchant:'Uber Eats', cat:'Food & Dining', sub:'Delivery'},
            {raw:'AMZN MKTP US*2K7RQ1FW0', amt:'$89.99', mcc:'5942', merchant:'Amazon', cat:'Shopping', sub:'Online Marketplace'},
            {raw:'SQ *BLUE BOTTLE COFFE SAN FRANCISCO', amt:'$6.75', mcc:'5814', merchant:'Blue Bottle Coffee', cat:'Food & Dining', sub:'Coffee & Tea'},
            {raw:'NETFLIX.COM 866-579-7172 CA', amt:'$15.49', mcc:'4899', merchant:'Netflix', cat:'Entertainment', sub:'Streaming'}
          ],
          stages: [
            {title:'Health-Conscious Shopper', desc:'Organic grocery preference detected.', chips:[
              {icon:'\\u{1F951}', label:'Organic Shopper', count:'12\\u00D7'}
            ]},
            {title:'Digital-First Consumer', desc:'Online ordering and delivery patterns emerging.', chips:[
              {icon:'\\u{1F951}', label:'Organic Shopper', count:'12\\u00D7'},
              {icon:'\\u{1F4F1}', label:'Digital-First', count:'8\\u00D7'}
            ]},
            {title:'Tech-Savvy Shopper', desc:'Active online marketplace user with diverse purchase categories.', chips:[
              {icon:'\\u{1F951}', label:'Organic Shopper', count:'12\\u00D7'},
              {icon:'\\u{1F4F1}', label:'Digital-First', count:'8\\u00D7'},
              {icon:'\\u{1F6D2}', label:'Online Marketplace', count:'5\\u00D7'}
            ]},
            {title:'Urban Professional', desc:'Premium brand affinity with specialty coffee habit.', chips:[
              {icon:'\\u{1F951}', label:'Organic Shopper', count:'12\\u00D7'},
              {icon:'\\u{1F4F1}', label:'Digital-First', count:'8\\u00D7'},
              {icon:'\\u{1F6D2}', label:'Online Marketplace', count:'5\\u00D7'},
              {icon:'\\u2615', label:'Coffee Enthusiast', count:'15\\u00D7'}
            ]},
            {title:'Urban Professional', desc:'Health-conscious, tech-savvy consumer with premium brand affinity and subscription-based lifestyle.', chips:[
              {icon:'\\u{1F951}', label:'Organic Shopper', count:'12\\u00D7'},
              {icon:'\\u{1F4F1}', label:'Digital-First', count:'8\\u00D7'},
              {icon:'\\u{1F6D2}', label:'Online Marketplace', count:'5\\u00D7'},
              {icon:'\\u2615', label:'Coffee Enthusiast', count:'15\\u00D7'},
              {icon:'\\u{1F3AC}', label:'Entertainment Sub', count:'3\\u00D7'},
              {icon:'\\u{1F3D9}\\uFE0F', label:'Urban Lifestyle', count:''}
            ]}
          ]
        },
        {
          rows: [
            {raw:'DELTA AIR 006-2847193847', amt:'$487.00', mcc:'3058', merchant:'Delta Air Lines', cat:'Travel', sub:'Airlines'},
            {raw:'MARRIOTT HTEL CHI ORD IL', amt:'$219.50', mcc:'3501', merchant:'Marriott Hotels', cat:'Travel', sub:'Lodging'},
            {raw:'HERTZ RENT-A-CAR LAX', amt:'$94.33', mcc:'7512', merchant:'Hertz', cat:'Travel', sub:'Car Rental'},
            {raw:'TSA PRECHECK ENROLLMENT DC', amt:'$78.00', mcc:'9399', merchant:'Global Entry / TSA', cat:'Government', sub:'Travel Services'},
            {raw:'UBER *TRIP HELP.UBER.COM', amt:'$42.15', mcc:'4121', merchant:'Uber', cat:'Transportation', sub:'Rideshare'}
          ],
          stages: [
            {title:'Air Traveler', desc:'Airline booking activity detected.', chips:[
              {icon:'\\u2708\\uFE0F', label:'Air Travel', count:'24\\u00D7'}
            ]},
            {title:'Travel Professional', desc:'Hotel loyalty program engagement identified.', chips:[
              {icon:'\\u2708\\uFE0F', label:'Air Travel', count:'24\\u00D7'},
              {icon:'\\u{1F3E8}', label:'Hotel Loyalty', count:'18\\u00D7'}
            ]},
            {title:'High-Mobility Professional', desc:'Consistent rental car usage across airports.', chips:[
              {icon:'\\u2708\\uFE0F', label:'Air Travel', count:'24\\u00D7'},
              {icon:'\\u{1F3E8}', label:'Hotel Loyalty', count:'18\\u00D7'},
              {icon:'\\u{1F697}', label:'Car Rental', count:'9\\u00D7'}
            ]},
            {title:'Frequent Traveler', desc:'Premium travel services and expedited screening.', chips:[
              {icon:'\\u2708\\uFE0F', label:'Air Travel', count:'24\\u00D7'},
              {icon:'\\u{1F3E8}', label:'Hotel Loyalty', count:'18\\u00D7'},
              {icon:'\\u{1F697}', label:'Car Rental', count:'9\\u00D7'},
              {icon:'\\u{1F30E}', label:"Int'l Spend", count:'6\\u00D7'}
            ]},
            {title:'Frequent Traveler', desc:'High-mobility professional with loyalty program engagement and premium travel preferences.', chips:[
              {icon:'\\u2708\\uFE0F', label:'Air Travel', count:'24\\u00D7'},
              {icon:'\\u{1F3E8}', label:'Hotel Loyalty', count:'18\\u00D7'},
              {icon:'\\u{1F697}', label:'Car Rental', count:'9\\u00D7'},
              {icon:'\\u{1F30E}', label:"Int'l Spend", count:'6\\u00D7'},
              {icon:'\\u{1F4BC}', label:'Business Travel', count:''}
            ]}
          ]
        },
        {
          rows: [
            {raw:'TARGET T-1847 PLANO TX', amt:'$156.23', mcc:'5311', merchant:'Target', cat:'Shopping', sub:'Department Store'},
            {raw:'PEDIATRIC ASSOC COPAY', amt:'$35.00', mcc:'8011', merchant:'Pediatrics Co-Pay', cat:'Healthcare', sub:'Medical Services'},
            {raw:'DISNEY PLUS 888-905-7888', amt:'$13.99', mcc:'4899', merchant:'Disney+', cat:'Entertainment', sub:'Streaming'},
            {raw:'COSTCO WHSE #482 FRISCO TX', amt:'$312.47', mcc:'5300', merchant:'Costco', cat:'Shopping', sub:'Wholesale Club'},
            {raw:'KUMON MATH & READING CTR', amt:'$160.00', mcc:'8299', merchant:'Kumon', cat:'Education', sub:'Tutoring'}
          ],
          stages: [
            {title:'Household Shopper', desc:'Department store spending pattern detected.', chips:[
              {icon:'\\u{1F6D2}', label:'Bulk Shopper', count:'16\\u00D7'}
            ]},
            {title:'Family-Focused Spender', desc:'Pediatric healthcare expenses identified.', chips:[
              {icon:'\\u{1F6D2}', label:'Bulk Shopper', count:'16\\u00D7'},
              {icon:'\\u{1F476}', label:'Family Care', count:'11\\u00D7'}
            ]},
            {title:'Family Entertainment', desc:'Family-oriented streaming and entertainment subscriptions.', chips:[
              {icon:'\\u{1F6D2}', label:'Bulk Shopper', count:'16\\u00D7'},
              {icon:'\\u{1F476}', label:'Family Care', count:'11\\u00D7'},
              {icon:'\\u{1F4DA}', label:'Education', count:'8\\u00D7'}
            ]},
            {title:'Young Family', desc:'Wholesale bulk purchasing for household needs.', chips:[
              {icon:'\\u{1F6D2}', label:'Bulk Shopper', count:'16\\u00D7'},
              {icon:'\\u{1F476}', label:'Family Care', count:'11\\u00D7'},
              {icon:'\\u{1F4DA}', label:'Education', count:'8\\u00D7'},
              {icon:'\\u{1F3E5}', label:'Healthcare', count:'5\\u00D7'}
            ]},
            {title:'Young Family', desc:"Household-focused spender prioritizing children's education, healthcare, and family entertainment.", chips:[
              {icon:'\\u{1F6D2}', label:'Bulk Shopper', count:'16\\u00D7'},
              {icon:'\\u{1F476}', label:'Family Care', count:'11\\u00D7'},
              {icon:'\\u{1F4DA}', label:'Education', count:'8\\u00D7'},
              {icon:'\\u{1F3E5}', label:'Healthcare', count:'5\\u00D7'},
              {icon:'\\u{1F3E1}', label:'Suburban Life', count:''}
            ]}
          ]
        }
      ];

      var tbody = root.querySelector('#vte-tbody');
      var personaWrap = root.querySelector('#vte-persona');
      var currentSet = 0;
      var timers = [];

      function clearTimers(){
        timers.forEach(function(t){ clearTimeout(t); });
        timers = [];
      }

      function buildRowHtml(r){
        return '<div class="vte-row data-row">'
          +'<div class="vte-cell raw" data-label="Raw Transaction">'+r.raw+'</div>'
          +'<div class="vte-cell one" data-label="Amount">'+r.amt+'</div>'
          +'<div class="vte-cell one" data-label="MCC">'+r.mcc+'</div>'
          +'<div class="vte-cell one derived" data-label="Merchant"><span class="derived-text">'+r.merchant+'</span></div>'
          +'<div class="vte-cell one derived" data-label="Category"><span class="derived-text">'+r.cat+'</span></div>'
          +'<div class="vte-cell one derived" data-label="Sub-Category"><span class="derived-text">'+r.sub+'</span></div>'
          +'</div>';
      }

      function buildPersonaHtml(p){
        var chipsHtml = p.chips.map(function(c){
          return '<span class="chip"><strong>'+c.icon+' '+c.label+'</strong>'
            +(c.count ? ' <span class="count">'+c.count+'</span>' : '')+'</span>';
        }).join('');
        return '<div class="persona-panel">'
          +'<p class="persona-summary"><span class="key">'+p.title+'</span> \\u00B7 '+p.desc+'</p>'
          +'<div class="signal-top"><span class="signal-label">Signals</span>'
          +'<div class="chips">'+chipsHtml+'</div></div></div>';
      }

      function runCycle(){
        clearTimers();
        root.classList.remove('vte-fade-out');

        var ds = datasets[currentSet % datasets.length];
        currentSet++;

        // Render rows hidden
        tbody.innerHTML = ds.rows.map(buildRowHtml).join('');
        personaWrap.innerHTML = '';
        personaWrap.classList.remove('visible');
        personaWrap.classList.remove('updating');

        var rows = tbody.querySelectorAll('.data-row');
        var ROW_GAP = 800;
        var DERIVED_OFFSET = 300;
        var PERSONA_OFFSET = 200;

        rows.forEach(function(row, i){
          // Reveal row
          timers.push(setTimeout(function(){
            row.classList.add('visible');
          }, i * ROW_GAP));

          // Reveal derived cells
          var derivedCells = row.querySelectorAll('.derived');
          timers.push(setTimeout(function(){
            derivedCells.forEach(function(d){ d.classList.add('revealed'); });
          }, i * ROW_GAP + DERIVED_OFFSET));

          // Update persona after derived columns are revealed
          timers.push(setTimeout(function(){
            if (i === 0) {
              // First row: just set content and fade in
              personaWrap.innerHTML = buildPersonaHtml(ds.stages[i]);
              personaWrap.classList.add('visible');
            } else {
              // Subsequent rows: crossfade
              personaWrap.classList.add('updating');
              timers.push(setTimeout(function(){
                personaWrap.innerHTML = buildPersonaHtml(ds.stages[i]);
                personaWrap.classList.remove('updating');
              }, 200));
            }
          }, i * ROW_GAP + DERIVED_OFFSET + PERSONA_OFFSET));
        });

        var allRowsDone = (rows.length - 1) * ROW_GAP + DERIVED_OFFSET + PERSONA_OFFSET + 400;

        // Fade out everything
        timers.push(setTimeout(function(){
          root.classList.add('vte-fade-out');
          personaWrap.classList.remove('visible');
        }, allRowsDone + 2000));

        // Next cycle
        timers.push(setTimeout(runCycle, allRowsDone + 2700));
      }

      runCycle();
    })();
  <\/script>
</div>`;
