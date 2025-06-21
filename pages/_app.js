import { SessionProvider } from 'next-auth/react'
import PlausibleProvider from 'next-plausible'
import FeedbackSystem from '../components/FeedbackSystem'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}) {
  return (
    <PlausibleProvider domain="veridiff.com">
      <SessionProvider session={session}>
        <Component {...pageProps} />
        <FeedbackSystem />
      </SessionProvider>
    </PlausibleProvider>
  )
}
