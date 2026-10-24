import { countOnRoute, countOnStack, describeCount } from '../lib/flaws';
import { loadAllIssues } from '../lib/source';
import s from '../styles/landing.module.css';
import { BoardLink } from './BoardLink';

// Server component: the flaw counts come from the same GitHub issues as the challenge board.
export async function Anatomy() {
  const issues = await loadAllIssues();
  const flaws = (stack: string) => {
    const n = countOnStack(issues, stack);
    return n > 0 ? <BoardLink filter={{ stack }}>{describeCount(n)}</BoardLink> : null;
  };
  const cart = countOnRoute(issues, '/cart');
  return (
    <div className={s.section}>
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 className={`${s.display} ${s.sectionTitle}`}>Five languages, one shared database</h2>
          <p>The worst bugs live inside each layer and in the gaps between them.</p>
        </div>
        <div className={s.bento}>
          <article className={`${s.cell} ${s.cFront}`}>
            <div><h3 className={`${s.display} ${s.cellTitle}`}>Next.js frontend</h3></div>
            <div>
              <p>Every bad pattern gets its own page, so each one is a challenge you can pick up on its own.</p>
              <p>
                The cart lives only in the browser&apos;s localStorage, card details included.
                {cart > 0 && (
                  <>
                    {' '}
                    <BoardLink filter={{ query: '/cart' }}>{`See the ${cart} cart flaws`}</BoardLink>
                  </>
                )}
              </p>
              <span className={s.pin}>React 17 / TypeScript 4.5</span>
              {flaws('Frontend')}
            </div>
          </article>
          <article className={`${s.cell} ${s.cPy}`}>
            <h3 className={`${s.display} ${s.cellTitle}`}>Python API</h3>
            <div>
              <p>Trusts the client. Leaks its config.</p>
              <span className={s.pin}>Python 3.8 / Pydantic v1</span>
              {flaws('Python API')}
            </div>
          </article>
          <article className={`${s.cell} ${s.cPhp}`}>
            <h3 className={`${s.display} ${s.cellTitle}`}>PHP legacy</h3>
            <div>
              <p>Concatenates SQL. Stores passwords like it&apos;s 2008.</p>
              <span className={s.pin}>PHP 7.4</span>
              {flaws('PHP service')}
            </div>
          </article>
          <article className={`${s.cell} ${s.cDb}`}>
            <h3 className={`${s.display} ${s.cellTitle}`}>One MySQL</h3>
            <div>
              <p>Python and PHP both write straight into it.</p>
              <span className={s.pin}>MySQL 8.0</span>
            </div>
          </article>
          <article className={`${s.cell} ${s.cGo}`}>
            <h3 className={`${s.display} ${s.cellTitle}`}>Go and Redis</h3>
            <div>
              <p>The seat-booking deep end. Arrives in v2.0.</p>
              <span className={s.pin}>Go 1.19</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
