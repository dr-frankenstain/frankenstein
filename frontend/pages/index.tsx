import type { GetServerSideProps } from 'next';

const LANDING_URL = (process.env.NEXT_PUBLIC_LANDING_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

// The landing page lives in its own app. This route only forwards visitors there; the
// destination is fixed, and redirectTo is passed along as data, never followed.
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const redirectTo = typeof query.redirectTo === 'string' ? query.redirectTo : null;
  const suffix = redirectTo === null ? '' : `?redirectTo=${encodeURIComponent(redirectTo)}`;
  return { redirect: { destination: `${LANDING_URL}/${suffix}`, statusCode: 302 } };
};

export default function Index() {
  return null;
}
