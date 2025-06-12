import { SessionProvider } from 'next-auth/react'
import FeedbackSystem from '../components/FeedbackSystem'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <FeedbackSystem />
    </SessionProvider>
  )
}
