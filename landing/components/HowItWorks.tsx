import s from '../styles/landing.module.css';

const STEPS = [
  { title: 'Pick', text: 'Choose an issue. Each one documents exactly one flaw, tagged by discipline and difficulty.' },
  { title: 'Fork', text: 'Work in your own fork on a solution branch. Nothing you do touches the monster.' },
  { title: 'Fix', text: 'Open a pull request. It will never be merged, and that is the point. It is your answer, on the record.' },
  { title: 'Vote', text: "The community reacts with a thumbs-up. The top-voted pull request is the crowd's best answer." },
];

export function HowItWorks() {
  return (
    <div className={s.section}>
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 className={`${s.display} ${s.sectionTitle}`}>Fix it on paper</h2>
          <p>The main branch only gets worse. Your fix is an answer, not a patch.</p>
        </div>
        <div className={s.stack}>
          {STEPS.map((step) => (
            <div key={step.title} className={s.stackCard}>
              <div className={s.stackInner}>
                <h3 className={`${s.display} ${s.stackTitle}`}>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
