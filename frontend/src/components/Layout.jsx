import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-enter">
        {children}
      </main>
      <Footer />
    </>
  )
}
