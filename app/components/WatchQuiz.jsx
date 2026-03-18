import {useState} from 'react';
import {Link} from 'react-router';

const QUESTIONS = [
  {id:'gender',question:"Who are you shopping for?",options:[{label:"Myself (Men's)",value:'mens',icon:'⌚'},{label:"Myself (Women's)",value:'womens',icon:'✨'},{label:'A Gift',value:'gift',icon:'🎁'}]},
  {id:'style',question:"What's your style?",options:[{label:'Classic & Elegant',value:'dress',icon:'🎩'},{label:'Sport & Active',value:'sport',icon:'🏃'},{label:'Casual & Modern',value:'casual',icon:'👕'},{label:'Bold & Unique',value:'bold',icon:'🔥'}]},
  {id:'budget',question:"What's your budget?",options:[{label:'Under $100',value:'under-100',icon:'💰'},{label:'$100 – $200',value:'100-200',icon:'💎'},{label:'$200+',value:'200plus',icon:'👑'},{label:'No limit',value:'all',icon:'🌟'}]},
  {id:'movement',question:"Movement preference?",options:[{label:'Automatic',value:'automatic',icon:'⚙️'},{label:'Quartz',value:'quartz',icon:'⚡'},{label:'No preference',value:'any',icon:'🤷'}]},
];

// Uses real collection handles from the project
function getResult(answers) {
  const {gender, style, budget, movement} = answers;

  // Budget overrides everything
  if (budget === 'under-100') return '/collections/under-100';

  // Movement specific
  if (movement === 'automatic') return '/collections/automatic-watches';

  // Gender + style matrix using real handles
  if (gender === 'womens') return '/collections/womens-watches';

  const map = {
    'dress': '/collections/dress-watches',
    'sport': '/collections/sport-watches',
    'casual': '/collections/mens-watches',
    'bold':   '/collections/automatic-watches',
  };

  return map[style] || '/collections/all';
}

export function WatchQuiz({onClose}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const question = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;

  const handleAnswer = (value) => {
    const newAnswers = {...answers, [question.id]: value};
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const resultUrl = getResult(answers);

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{background:'#fff',width:'100%',maxWidth:'500px',overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,0.3)'}}>

        {/* Header */}
        <div style={{padding:'22px 28px 18px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#999',margin:'0 0 3px'}}>Watch Finder</p>
            <h3 style={{fontSize:'17px',fontWeight:500,margin:0}}>Find Your Perfect Watch</h3>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'#bbb',lineHeight:1}}>✕</button>
        </div>

        {/* Progress */}
        <div style={{height:'2px',background:'#f0f0f0'}}>
          <div style={{height:'100%',background:'#000',width:done?'100%':`${progress}%`,transition:'width 0.4s ease'}} />
        </div>

        {done ? (
          <div style={{padding:'44px 28px',textAlign:'center'}}>
            <div style={{fontSize:'44px',marginBottom:'14px'}}>🎯</div>
            <h3 style={{fontSize:'20px',fontWeight:500,margin:'0 0 8px'}}>We found your match!</h3>
            <p style={{fontSize:'13px',color:'#666',margin:'0 0 28px',lineHeight:1.6}}>Based on your preferences, we selected the perfect collection for you.</p>
            <Link
              to={resultUrl}
              onClick={onClose}
              style={{display:'inline-block',padding:'13px 36px',background:'#000',color:'#fff',textDecoration:'none',fontSize:'12px',fontWeight:600,letterSpacing:'1px'}}
            >
              View My Collection →
            </Link>
            <br/>
            <button onClick={()=>{setStep(0);setAnswers({});setDone(false);}} style={{background:'none',border:'none',fontSize:'11px',color:'#999',cursor:'pointer',textDecoration:'underline',marginTop:'14px'}}>
              Start over
            </button>
          </div>
        ) : (
          <div style={{padding:'28px 28px 32px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'22px'}}>
              <h4 style={{fontSize:'15px',fontWeight:500,margin:0,lineHeight:1.4}}>{question.question}</h4>
              <span style={{fontSize:'11px',color:'#bbb',flexShrink:0,marginLeft:'12px'}}>{step+1} / {QUESTIONS.length}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:question.options.length===3?'1fr 1fr 1fr':'1fr 1fr',gap:'10px'}}>
              {question.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  style={{padding:'14px 10px',border:'1px solid #e8e8e8',background:'#fff',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#000';e.currentTarget.style.background='#f8f8f8';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#e8e8e8';e.currentTarget.style.background='#fff';}}
                >
                  <span style={{fontSize:'22px'}}>{opt.icon}</span>
                  <span style={{fontSize:'11px',fontWeight:500,color:'#000',lineHeight:1.3,textAlign:'center'}}>{opt.label}</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button onClick={()=>setStep(step-1)} style={{background:'none',border:'none',fontSize:'11px',color:'#999',cursor:'pointer',marginTop:'18px',textDecoration:'underline'}}>
                ← Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
