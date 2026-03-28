import {useRef} from 'react';

const REVIEWS = [
  {initials:'JM', name:'James M.', location:'New York, USA', product:'Pagani Design', text:"Absolutely stunning watch. The craftsmanship is exceptional — feels like a much more expensive piece. I've received so many compliments wearing it."},
  {initials:'SL', name:'Sophie L.', location:'London, UK', product:'San Martin', text:"Arrived in perfect condition, beautifully packaged. The dial is gorgeous in person — photos don't do it justice. Will definitely be ordering again."},
  {initials:'TW', name:'Tom W.', location:'Sydney, Australia', product:'North Edge', text:"Fast shipping to Sydney, arrived in 8 days. Exactly as described — solid build, smooth bezel action. Excellent value for the price point."},
  {initials:'MC', name:'Maria C.', location:'Toronto, Canada', product:'Fossil', text:"Bought this as a gift for my husband. He was blown away — said it looks and feels like a luxury watch costing five times more. Vastara delivered on every promise."},
  {initials:'RK', name:'Ryan K.', location:'Chicago, USA', product:'Pagani Design', text:"Third watch from Vastara and every single one has been perfect. Customer service is responsive and the quality is consistent. These are my go-to for gifts now."},
  {initials:'AL', name:'Adam L.', location:'Manchester, UK', product:'San Martin', text:"The automatic movement is incredibly smooth. Wound it up and it's been keeping perfect time for two weeks. Incredible watch at this price — genuinely impressive."},
];

export function ReviewsStrip() {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({left: dir * 320, behavior: 'smooth'});
    }
  };

  return (
    <section className="rv-section">
      <style suppressHydrationWarning>{`
        .rv-section{background:#0c0c0c;padding:64px 48px;overflow:hidden}
        .rv-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;gap:20px;flex-wrap:wrap}
        .rv-label{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px}
        .rv-title{font-size:28px;font-weight:400;color:#fff;line-height:1.25}
        .rv-overall{display:flex;align-items:center;gap:12px;margin-top:14px}
        .rv-big-score{font-size:42px;font-weight:300;color:#c9a84c;line-height:1}
        .rv-stars{color:#c9a84c;font-size:16px;letter-spacing:2px}
        .rv-score-count{font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px}
        .rv-arrows{display:flex;gap:8px;flex-shrink:0}
        .rv-arrow{width:38px;height:38px;border:0.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.6);font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s;flex-shrink:0}
        .rv-arrow:hover{border-color:#c9a84c;color:#c9a84c}
        .rv-track{display:flex;gap:20px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;padding-bottom:4px;-webkit-overflow-scrolling:touch}
        .rv-track::-webkit-scrollbar{display:none}
        .rv-card{min-width:300px;width:300px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.09);border-radius:12px;padding:24px;flex-shrink:0;transition:border-color 0.2s}
        .rv-card:hover{border-color:rgba(201,168,76,0.3)}
        .rv-card-stars{color:#c9a84c;font-size:13px;letter-spacing:2px;margin-bottom:14px}
        .rv-card-text{font-size:13px;color:rgba(255,255,255,0.7);line-height:1.85;margin-bottom:20px;font-style:italic}
        .rv-card-footer{display:flex;align-items:center;gap:12px;border-top:0.5px solid rgba(255,255,255,0.07);padding-top:16px}
        .rv-avatar{width:36px;height:36px;border-radius:50%;background:rgba(201,168,76,0.1);border:0.5px solid rgba(201,168,76,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;color:#c9a84c;font-weight:600;flex-shrink:0}
        .rv-author-name{font-size:12px;color:rgba(255,255,255,0.8);font-weight:500}
        .rv-author-meta{font-size:10px;color:rgba(255,255,255,0.25);margin-top:2px}
        .rv-verified{display:flex;align-items:center;gap:4px;margin-top:4px}
        .rv-verified-dot{width:6px;height:6px;min-width:6px;background:#c9a84c;border-radius:50%}
        .rv-verified-text{font-size:9px;color:#c9a84c;letter-spacing:1px;text-transform:uppercase}
        .rv-bottom{margin-top:40px;padding-top:28px;border-top:0.5px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px}
        .rv-stats{display:flex;align-items:center;gap:24px}
        .rv-stat-num{font-size:20px;color:#c9a84c;font-weight:400}
        .rv-stat-label{font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:2px;text-transform:uppercase;margin-top:2px}
        .rv-divider{width:1px;height:32px;background:rgba(255,255,255,0.08)}
        .rv-countries{font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;text-transform:uppercase}
        @media(max-width:900px){
          .rv-section{padding:48px 24px}
          .rv-title{font-size:24px}
          .rv-big-score{font-size:36px}
          .rv-countries{display:none}
        }
        @media(max-width:600px){
          .rv-section{padding:40px 16px}
          .rv-header{flex-direction:column;align-items:flex-start;margin-bottom:32px}
          .rv-arrows{align-self:flex-end}
          .rv-title{font-size:22px}
          .rv-big-score{font-size:32px}
          .rv-stars{font-size:14px}
          .rv-score-count{font-size:10px}
          .rv-card{min-width:calc(100vw - 64px);width:calc(100vw - 64px);padding:20px}
          .rv-card-text{font-size:12px}
          .rv-bottom{flex-direction:column;align-items:flex-start;gap:16px}
          .rv-stats{gap:12px}
          .rv-stat-num{font-size:18px}
          .rv-divider{height:24px}
        }
      `}</style>

      <div className="rv-header">
        <div>
          <p className="rv-label">Customer Reviews</p>
          <h2 className="rv-title">Worn & Loved<br />Around the World</h2>
          <div className="rv-overall">
            <span className="rv-big-score">4.9</span>
            <div>
              <div className="rv-stars">★★★★★</div>
              <div className="rv-score-count">Based on 2,400+ verified orders</div>
            </div>
          </div>
        </div>
        <div className="rv-arrows">
          <button className="rv-arrow" onClick={() => scroll(-1)}>←</button>
          <button className="rv-arrow" onClick={() => scroll(1)}>→</button>
        </div>
      </div>

      <div className="rv-track" ref={trackRef}>
        {REVIEWS.map((r) => (
          <div key={r.name} className="rv-card">
            <div className="rv-card-stars">★★★★★</div>
            <p className="rv-card-text">"{r.text}"</p>
            <div className="rv-card-footer">
              <div className="rv-avatar">{r.initials}</div>
              <div>
                <div className="rv-author-name">{r.name}</div>
                <div className="rv-author-meta">{r.location} · {r.product}</div>
                <div className="rv-verified">
                  <div className="rv-verified-dot" />
                  <span className="rv-verified-text">Verified Purchase</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rv-bottom">
        <div className="rv-stats">
          <div className="rv-stat">
            <div className="rv-stat-num">2,400+</div>
            <div className="rv-stat-label">Orders Shipped</div>
          </div>
          <div className="rv-divider" />
          <div className="rv-stat">
            <div className="rv-stat-num">98%</div>
            <div className="rv-stat-label">Satisfaction Rate</div>
          </div>
          <div className="rv-divider" />
          <div className="rv-stat">
            <div className="rv-stat-num">4</div>
            <div className="rv-stat-label">Countries Served</div>
          </div>
        </div>
        <div className="rv-countries">USA · UK · Canada · Australia</div>
      </div>
    </section>
  );
}
