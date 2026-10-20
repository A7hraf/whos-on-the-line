/* Who's on the Line? — parametric character art.
 * Four base illustrations from the design handoff (Salim, Hamed, Maryam, Noor),
 * each with variants (colours, eyes, glasses, props) so that a visitor's look
 * never gives away their secret role.
 *
 * drawCharacter({ base, v }, { busted }) -> SVG/HTML string (viewBox 400x440)
 *   base: 'dish' | 'polo' | 'abaya' | 'shayla'
 */
(function () {
  const INK = '#1b1410';
  const SKIN = {
    a: ['#c68b5e', '#b97f55', '#9c6a45'], // face, neck, shade
    b: ['#b07850', '#a8704a', '#9c6a45'],
    c: ['#d9a27a', '#c48d66', '#b07850'],
    d: ['#e0b08a', '#d29d76', '#c48d66'],
    e: ['#a86f48', '#9a6440', '#86552f']
  };

  function svgOpen() {
    return '<svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMax meet" style="width:100%;height:100%;display:block;overflow:visible" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">';
  }

  // Eyes, reused across bases
  function eyesRound(cy, look) {
    const dx = look === 'side' ? 9 : look === 'up' ? 2 : 4;
    return '<ellipse cx="164" cy="' + cy + '" rx="20" ry="22" fill="#fff" stroke-width="5"/>' +
      '<ellipse cx="236" cy="' + cy + '" rx="20" ry="22" fill="#fff" stroke-width="5"/>' +
      '<circle cx="' + (164 + dx) + '" cy="' + (cy + 4) + '" r="9" fill="' + INK + '" stroke="none"/>' +
      '<circle cx="' + (236 + dx) + '" cy="' + (cy + 4) + '" r="9" fill="' + INK + '" stroke="none"/>' +
      '<circle cx="' + (168 + dx) + '" cy="' + (cy - 1) + '" r="3" fill="#fff" stroke="none"/>' +
      '<circle cx="' + (240 + dx) + '" cy="' + (cy - 1) + '" r="3" fill="#fff" stroke="none"/>';
  }
  function eyesFriendly(cy) {
    return '<ellipse cx="166" cy="' + cy + '" rx="22" ry="26" fill="#fff" stroke-width="5"/>' +
      '<ellipse cx="234" cy="' + cy + '" rx="22" ry="26" fill="#fff" stroke-width="5"/>' +
      '<circle cx="166" cy="' + (cy + 4) + '" r="12" fill="#3a2418" stroke="none"/>' +
      '<circle cx="234" cy="' + (cy + 4) + '" r="12" fill="#3a2418" stroke="none"/>' +
      '<circle cx="171" cy="' + (cy - 2) + '" r="4.5" fill="#fff" stroke="none"/>' +
      '<circle cx="239" cy="' + (cy - 2) + '" r="4.5" fill="#fff" stroke="none"/>';
  }
  function brows(kind, y) {
    // kind: worried | neutral | happy | stern
    if (kind === 'worried') return '<path d="M138 ' + (y + 18) + ' C152 ' + (y + 10) + ' 168 ' + (y + 2) + ' 184 ' + y + '" stroke-width="9" fill="none"/><path d="M216 ' + y + ' C232 ' + (y + 2) + ' 248 ' + (y + 10) + ' 262 ' + (y + 18) + '" stroke-width="9" fill="none"/>';
    if (kind === 'happy') return '<path d="M140 ' + (y + 8) + ' C152 ' + (y - 2) + ' 170 ' + (y - 2) + ' 184 ' + (y + 6) + '" stroke-width="8" fill="none"/><path d="M216 ' + (y + 6) + ' C230 ' + (y - 2) + ' 248 ' + (y - 2) + ' 260 ' + (y + 8) + '" stroke-width="8" fill="none"/>';
    if (kind === 'stern') return '<path d="M138 ' + y + ' C152 ' + (y + 4) + ' 170 ' + (y + 10) + ' 186 ' + (y + 12) + '" stroke-width="9" fill="none"/><path d="M214 ' + (y + 12) + ' C230 ' + (y + 10) + ' 248 ' + (y + 4) + ' 262 ' + y + '" stroke-width="9" fill="none"/>';
    return '<path d="M140 ' + (y + 6) + ' C154 ' + y + ' 170 ' + y + ' 184 ' + (y + 4) + '" stroke-width="8" fill="none"/><path d="M216 ' + (y + 4) + ' C230 ' + y + ' 246 ' + y + ' 260 ' + (y + 6) + '" stroke-width="8" fill="none"/>';
  }
  function mouth(kind) {
    if (kind === 'smile') return '<path d="M170 262 C186 288 214 288 230 262 Z" fill="#7a2a2a" stroke-width="5"/><path d="M176 264 L224 264 C220 272 180 272 176 264 Z" fill="#fff" stroke="none"/>';
    if (kind === 'smirk') return '<path d="M170 272 C190 282 216 280 238 260" fill="none"/><path d="M238 260 L246 256" fill="none" stroke-width="4"/>';
    if (kind === 'flat') return '<path d="M176 274 C192 278 210 278 226 272" fill="none" stroke-width="6"/>';
    if (kind === 'o') return '<ellipse cx="200" cy="276" rx="14" ry="12" fill="#5a1d1d" stroke-width="5"/>';
    // open/talking (default, Salim)
    return '<path d="M172 274 C185 268 215 268 228 274 C226 298 174 298 172 274 Z" fill="#5a1d1d" stroke-width="5"/><path d="M178 275 C192 271 208 271 222 275 L220 281 C206 278 194 278 180 281 Z" fill="#fff" stroke="none"/>';
  }

  // ---- Base: dishdasha + kumma (Salim) ----
  function dish(v) {
    const s = SKIN[v.skin || 'a'];
    const robe = v.robe || '#f4f1ea';
    const cap = v.cap || '#f6f0de';
    const capBand = v.capBand || '#c9a31c';
    const capPat = v.capPat || '#1d5694';
    let o = svgOpen();
    o += '<path d="M30 440 C34 370 90 330 160 322 L240 322 C310 330 366 370 370 440 Z" fill="' + robe + '"/>';
    o += '<path d="M110 372 C122 404 122 426 120 440 M290 372 C278 404 278 426 280 440" stroke="rgba(0,0,0,.18)" stroke-width="5" fill="none"/>';
    o += '<path d="M168 266 L168 330 C185 342 215 342 232 330 L232 266 Z" fill="' + s[1] + '"/>';
    o += '<path d="M160 322 C175 346 225 346 240 322" fill="none"/>';
    o += '<path d="M200 344 L200 404" stroke-width="4"/>';
    o += '<ellipse cx="200" cy="414" rx="9" ry="15" fill="' + (v.tassel || '#e8e1cf') + '" stroke-width="4"/>';
    o += '<ellipse cx="110" cy="204" rx="18" ry="26" fill="' + s[0] + '"/><ellipse cx="290" cy="204" rx="18" ry="26" fill="' + s[0] + '"/>';
    o += '<ellipse cx="200" cy="196" rx="92" ry="108" fill="' + s[0] + '"/>';
    if (v.beard !== false) o += '<path d="M124 232 C140 300 260 300 276 232 C262 272 232 294 200 294 C168 294 138 272 124 232 Z" fill="' + s[2] + '" opacity=".45" stroke="none"/>';
    if (v.headwear === 'massar') {
      // Omani turban (massar)
      o += '<path d="M102 160 C96 66 304 66 298 160 C252 140 148 140 102 160 Z" fill="' + cap + '"/>';
      o += '<path d="M108 150 C150 120 250 120 292 150 M112 128 C160 100 240 100 288 128" stroke="' + capPat + '" stroke-width="7" fill="none"/>';
      o += '<path d="M118 108 C160 84 240 84 282 108" stroke="' + capBand + '" stroke-width="6" fill="none" stroke-dasharray="3 10"/>';
    } else {
      o += '<path d="M106 162 C102 70 298 70 294 162 C250 147 150 147 106 162 Z" fill="' + cap + '"/>';
      o += '<path d="M112 150 C160 137 240 137 288 150" stroke="' + capBand + '" stroke-width="9" fill="none"/>';
      o += '<path d="M132 120 L144 104 L156 120 L168 104 L180 120 L192 104 L204 120 L216 104 L228 120 L240 104 L252 120 L264 104" stroke="' + capPat + '" stroke-width="4" fill="none"/>';
      o += '<g fill="' + capBand + '" stroke="none"><circle cx="150" cy="92" r="5"/><circle cx="176" cy="86" r="5"/><circle cx="202" cy="84" r="5"/><circle cx="228" cy="86" r="5"/><circle cx="254" cy="92" r="5"/></g>';
    }
    o += brows(v.brows || 'neutral', 150);
    if (v.glasses) {
      o += '<rect x="130" y="172" width="64" height="44" rx="14" fill="rgba(255,255,255,.25)" stroke-width="5"/><rect x="206" y="172" width="64" height="44" rx="14" fill="rgba(255,255,255,.25)" stroke-width="5"/><path d="M194 190 L206 190" fill="none" stroke-width="5"/>';
      o += '<circle cx="' + 166 + '" cy="196" r="8" fill="' + INK + '" stroke="none"/><circle cx="238" cy="196" r="8" fill="' + INK + '" stroke="none"/>';
    } else {
      o += eyesRound(192, v.look);
      o += '<path d="M148 216 C158 222 172 222 182 216 M218 216 C228 222 242 222 252 216" stroke-width="3" fill="none"/>';
    }
    o += '<path d="M200 194 C192 222 176 238 186 250 C194 258 214 256 222 246" fill="' + s[1] + '"/>';
    if (v.mustache !== false) o += '<path d="M166 262 C182 252 196 256 200 261 C204 256 218 252 234 262 C220 269 210 268 200 266 C190 268 180 269 166 262 Z" fill="#2a1d15" stroke-width="3"/>';
    o += mouth(v.mouth || 'talk');
    o += prop(v.prop, s[0]);
    return o + '</svg>';
  }

  // ---- Base: polo + lanyard (Hamed) ----
  function polo(v) {
    const s = SKIN[v.skin || 'b'];
    const shirt = v.shirt || '#2b3a55';
    const collar = v.collar || '#3f5275';
    const lan = v.lanyard || '#c8423a';
    let o = svgOpen();
    o += '<path d="M30 440 C34 370 90 330 160 322 L240 322 C310 330 366 370 370 440 Z" fill="' + shirt + '"/>';
    o += '<path d="M168 266 L168 330 C185 342 215 342 232 330 L232 266 Z" fill="' + s[1] + '"/>';
    o += '<path d="M158 322 L182 358 L200 332 L218 358 L242 322" fill="' + collar + '"/>';
    o += '<path d="M200 336 L200 392" fill="none"/><circle cx="200" cy="364" r="4" fill="#efe6c2" stroke="none"/>';
    if (v.badge) {
      o += '<path d="M174 330 C178 370 204 394 236 404" stroke="' + lan + '" stroke-width="7" fill="none"/>';
      o += '<path d="M226 330 C232 362 236 384 242 400" stroke="' + lan + '" stroke-width="7" fill="none"/>';
      const fs = v.badge.length > 7 ? 15 : 19;
      o += '<g transform="rotate(-6 255 420)"><rect x="208" y="396" width="94" height="60" rx="6" fill="#fff" stroke-width="5"/><rect x="208" y="396" width="94" height="14" fill="' + lan + '" stroke="none"/><text x="255" y="436" text-anchor="middle" font-family="Lalezar, sans-serif" font-size="' + fs + '" fill="' + INK + '" stroke="none">' + v.badge + '</text></g>';
    }
    o += '<ellipse cx="110" cy="204" rx="18" ry="26" fill="' + s[0] + '"/><ellipse cx="290" cy="204" rx="18" ry="26" fill="' + s[0] + '"/>';
    o += '<ellipse cx="200" cy="196" rx="92" ry="108" fill="' + s[0] + '"/>';
    o += '<path d="M108 172 C94 88 160 64 210 70 C264 74 304 104 292 174 C282 142 264 126 242 120 C214 138 160 134 130 122 C118 138 112 152 108 172 Z" fill="' + (v.hair || INK) + '"/>';
    if (v.beard) o += '<path d="M124 232 C140 300 260 300 276 232 C262 272 232 294 200 294 C168 294 138 272 124 232 Z" fill="' + (v.hair || INK) + '" opacity=".55" stroke="none"/>';
    if (v.glasses === 'mirror') {
      o += '<path d="M134 154 C150 146 172 146 188 152" stroke-width="8" fill="none"/><path d="M212 144 C228 132 252 134 268 148" stroke-width="8" fill="none"/>';
      o += '<rect x="126" y="166" width="68" height="46" rx="12" fill="#a8d4f5"/><rect x="206" y="166" width="68" height="46" rx="12" fill="#a8d4f5"/>';
      o += '<path d="M194 186 L206 186 M126 180 L108 186 M274 180 L292 186" fill="none"/>';
      o += '<path d="M140 202 L162 174 M220 202 L242 174" stroke="#fff" stroke-width="6" opacity=".9"/>';
    } else if (v.glasses === 'clear') {
      o += brows(v.brows || 'neutral', 150);
      o += eyesRound(190, v.look);
      o += '<rect x="130" y="166" width="68" height="48" rx="14" fill="none" stroke-width="5"/><rect x="202" y="166" width="68" height="48" rx="14" fill="none" stroke-width="5"/><path d="M198 186 L202 186" fill="none" stroke-width="5"/>';
    } else {
      o += brows(v.brows || 'neutral', 150);
      o += eyesRound(190, v.look);
    }
    o += '<path d="M200 208 C196 230 186 242 196 250 C204 254 214 250 214 244" fill="' + s[2] + '"/>';
    if (v.mustache) o += '<path d="M166 262 C182 252 196 256 200 261 C204 256 218 252 234 262 C220 269 210 268 200 266 C190 268 180 269 166 262 Z" fill="' + (v.hair || INK) + '" stroke-width="3"/>';
    o += mouth(v.mouth || 'smirk');
    if ((v.mouth || 'smirk') === 'smirk') o += '<path d="M186 292 Q200 316 214 292 Z" fill="' + INK + '" stroke-width="3" opacity="' + (v.beard ? 0 : 1) + '"/>';
    o += prop(v.prop, s[0]);
    return o + '</svg>';
  }

  // ---- Base: black shayla + abaya (Maryam) ----
  function abaya(v) {
    const s = SKIN[v.skin || 'c'];
    const cloth = v.cloth || '#221d27';
    const trim = v.trim || '#c9a31c';
    let o = svgOpen();
    o += '<path d="M30 440 C34 370 90 330 160 322 L240 322 C310 330 366 370 370 440 Z" fill="' + cloth + '"/>';
    o += '<path d="M164 334 C172 384 176 412 178 440 M236 334 C228 384 224 412 222 440" stroke="' + trim + '" stroke-width="6" fill="none"/>';
    o += '<path d="M92 212 C84 88 316 88 308 212 C312 292 300 334 250 348 L150 348 C100 334 88 292 92 212 Z" fill="' + cloth + '"/>';
    o += '<ellipse cx="200" cy="206" rx="78" ry="96" fill="' + s[0] + '"/>';
    o += '<path d="M114 196 C116 104 284 104 286 196 C262 144 138 144 114 196 Z" fill="' + cloth + '"/>';
    o += '<path d="M122 180 C150 144 250 144 278 180" stroke="' + trim + '" stroke-width="6" stroke-dasharray="2 12" fill="none"/>';
    o += '<path d="M130 170 C150 152 172 154 188 164" stroke-width="7" fill="none"/><path d="M212 164 C228 154 250 152 270 170" stroke-width="7" fill="none"/>';
    if (v.sunglasses !== false) {
      o += '<path d="M124 190 C124 176 190 174 194 190 C196 216 180 228 158 226 C136 224 124 208 124 190 Z" fill="' + INK + '"/>';
      o += '<path d="M206 190 C210 174 276 176 276 190 C276 208 264 224 242 226 C220 228 204 216 206 190 Z" fill="' + INK + '"/>';
      o += '<path d="M194 192 L206 192" fill="none"/><path d="M140 206 L158 184 M222 206 L240 184" stroke="#fff" stroke-width="5" opacity=".7"/>';
    } else {
      o += '<ellipse cx="164" cy="200" rx="19" ry="21" fill="#fff" stroke-width="5"/><ellipse cx="236" cy="200" rx="19" ry="21" fill="#fff" stroke-width="5"/>';
      o += '<circle cx="167" cy="204" r="10" fill="#3a2418" stroke="none"/><circle cx="239" cy="204" r="10" fill="#3a2418" stroke="none"/>';
      o += '<circle cx="171" cy="199" r="3.5" fill="#fff" stroke="none"/><circle cx="243" cy="199" r="3.5" fill="#fff" stroke="none"/>';
      o += '<path d="M144 186 L138 180 M256 186 L262 180" stroke-width="4"/>';
    }
    o += '<path d="M200 216 C194 236 190 244 198 250 C204 252 210 250 212 246" fill="' + s[1] + '" stroke-width="5"/>';
    const lip = v.lips || '#c8423a';
    if (v.mouth === 'smile') {
      o += '<path d="M172 266 C186 290 214 290 228 266 Z" fill="' + lip + '" stroke-width="5"/><path d="M178 268 L222 268 C218 275 182 275 178 268 Z" fill="#fff" stroke="none"/>';
    } else {
      o += '<path d="M172 270 C184 260 196 264 200 268 C204 264 216 260 228 270 C216 286 184 286 172 270 Z" fill="' + lip + '" stroke-width="5"/><path d="M174 270 C188 274 212 274 226 270" stroke-width="3" fill="none"/>';
    }
    if (v.mole !== false) o += '<circle cx="234" cy="250" r="4" fill="' + INK + '" stroke="none"/>';
    o += prop(v.prop === undefined ? 'phone' : v.prop, s[0]);
    return o + '</svg>';
  }

  // ---- Base: coloured shayla (Noor) ----
  function shayla(v) {
    const s = SKIN[v.skin || 'd'];
    const sh = v.cloth || '#a9cdee';
    const dots = v.dots || '#e6c95a';
    const body = v.body || '#1d2f55';
    let o = svgOpen();
    o += '<path d="M30 440 C34 370 90 330 160 322 L240 322 C310 330 366 370 370 440 Z" fill="' + body + '"/>';
    o += '<path d="M92 212 C84 88 316 88 308 212 C314 300 290 350 236 360 L164 360 C110 350 86 300 92 212 Z" fill="' + sh + '"/>';
    o += '<g fill="' + dots + '" stroke="none"><circle cx="112" cy="250" r="5"/><circle cx="104" cy="290" r="5"/><circle cx="290" cy="250" r="5"/><circle cx="298" cy="290" r="5"/><circle cx="130" cy="326" r="5"/><circle cx="272" cy="326" r="5"/><circle cx="150" cy="104" r="5"/><circle cx="250" cy="104" r="5"/></g>';
    o += '<ellipse cx="200" cy="206" rx="78" ry="96" fill="' + s[0] + '"/>';
    o += '<path d="M114 196 C116 104 284 104 286 196 C262 144 138 144 114 196 Z" fill="' + sh + '"/>';
    o += '<path d="M120 184 C150 146 250 146 280 184" stroke="#fbfaf5" stroke-width="7" fill="none"/>';
    if (v.brows === 'worried') o += '<path d="M144 172 C156 160 172 156 184 158 M216 158 C228 156 244 160 256 172" stroke-width="6" fill="none"/>';
    else if (v.brows === 'stern') o += '<path d="M144 160 C156 162 172 166 184 170 M216 170 C228 166 244 162 256 160" stroke-width="6" fill="none"/>';
    else o += '<path d="M144 166 C156 158 172 158 184 164 M216 164 C228 158 244 158 256 166" stroke-width="6" fill="none"/>';
    if (v.glasses) {
      o += eyesFriendly(198);
      o += '<rect x="136" y="170" width="62" height="54" rx="16" fill="none" stroke-width="5"/><rect x="202" y="170" width="62" height="54" rx="16" fill="none" stroke-width="5"/><path d="M198 192 L202 192" stroke-width="5"/>';
    } else {
      o += eyesFriendly(198);
      o += '<path d="M146 180 L140 174 M254 180 L260 174" stroke-width="4"/>';
    }
    if (v.blush !== false) o += '<ellipse cx="140" cy="242" rx="16" ry="10" fill="#e98a8a" opacity=".55" stroke="none"/><ellipse cx="260" cy="242" rx="16" ry="10" fill="#e98a8a" opacity=".55" stroke="none"/>';
    o += '<path d="M200 216 C196 232 194 238 200 242 C204 244 208 242 210 240" fill="none" stroke-width="5"/>';
    o += mouth(v.mouth || 'smile');
    o += prop(v.prop === undefined ? 'letter' : v.prop, s[0]);
    return o + '</svg>';
  }

  function prop(p, skin) {
    if (!p) return '';
    if (p === 'phone') {
      return '<g transform="rotate(14 300 350)"><rect x="276" y="292" width="50" height="88" rx="10" fill="' + INK + '"/><rect x="283" y="302" width="36" height="64" rx="4" fill="#4f86c6" stroke="none"/></g>' +
        '<ellipse cx="296" cy="378" rx="32" ry="24" fill="' + skin + '"/>';
    }
    if (p === 'letter') {
      return '<g transform="rotate(-5 200 410)"><rect x="118" y="362" width="164" height="112" rx="4" fill="#fbfaf5" stroke-width="5"/><rect x="138" y="374" width="64" height="10" fill="#1d5694" stroke="none"/><path d="M138 398 L244 398 M138 414 L262 414 M138 430 L232 430" stroke="#9aa6b8" stroke-width="5"/></g>' +
        '<ellipse cx="122" cy="404" rx="24" ry="18" fill="' + skin + '"/><ellipse cx="280" cy="398" rx="24" ry="18" fill="' + skin + '"/>';
    }
    if (p === 'folder') {
      return '<g transform="rotate(6 200 410)"><path d="M112 372 L170 372 L182 360 L288 360 L288 470 L112 470 Z" fill="#e6c95a" stroke-width="5"/><path d="M112 384 L288 384" stroke="#86690b" stroke-width="4"/></g>' +
        '<ellipse cx="116" cy="410" rx="24" ry="18" fill="' + skin + '"/><ellipse cx="284" cy="404" rx="24" ry="18" fill="' + skin + '"/>';
    }
    if (p === 'parcel') {
      return '<g transform="rotate(-4 200 410)"><rect x="120" y="356" width="160" height="110" rx="6" fill="#c08a52" stroke-width="5"/><path d="M200 356 L200 466 M120 392 L280 392" stroke="#8a5a2e" stroke-width="5"/><rect x="214" y="404" width="52" height="30" fill="#fbfaf5" stroke-width="3"/></g>' +
        '<ellipse cx="122" cy="410" rx="24" ry="18" fill="' + skin + '"/><ellipse cx="280" cy="404" rx="24" ry="18" fill="' + skin + '"/>';
    }
    if (p === 'laptop') {
      return '<g transform="rotate(-3 200 410)"><rect x="118" y="360" width="164" height="100" rx="8" fill="#9aa6b8" stroke-width="5"/><circle cx="200" cy="408" r="10" fill="#fbfaf5" stroke="none"/></g>' +
        '<ellipse cx="122" cy="412" rx="24" ry="18" fill="' + skin + '"/><ellipse cx="280" cy="406" rx="24" ry="18" fill="' + skin + '"/>';
    }
    return '';
  }

  function bustedOverlay() {
    return '<div class="busted-fx"><span class="drop d1"></span><span class="drop d2"></span></div><span class="busted-bang">!!</span>';
  }

  window.drawCharacter = function (who, opts) {
    opts = opts || {};
    const v = Object.assign({}, who.v || {});
    if (opts.mood === 'happy') {
      if (who.base === 'dish') { v.brows = 'happy'; v.mouth = 'talk'; }
      if (who.base === 'shayla') { v.mouth = 'smile'; v.brows = 'neutral'; }
      if (who.base === 'polo') { v.mouth = 'smile'; v.brows = 'happy'; }
      if (who.base === 'abaya') { v.mouth = 'smile'; }
    }
    if (opts.busted) {
      if (who.base === 'dish' || who.base === 'polo') { v.brows = 'worried'; v.mouth = 'o'; }
      if (who.base === 'shayla') { v.brows = 'worried'; v.mouth = 'o'; }
    }
    let svg;
    switch (who.base) {
      case 'polo': svg = polo(v); break;
      case 'abaya': svg = abaya(v); break;
      case 'shayla': svg = shayla(v); break;
      default: svg = dish(v);
    }
    return '<div class="char">' + svg + (opts.busted ? bustedOverlay() : '') + '</div>';
  };

  // Silhouette version (title screen queue / briefing)
  window.drawSilhouette = function (base) {
    const html = window.drawCharacter({ base: base, v: {} });
    return html.replace('<div class="char">', '<div class="char silhouette">');
  };
})();
