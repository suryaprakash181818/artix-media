import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../WhatsAppButton';
import FeedbackWidget from '../FeedbackWidget';

const MainLayout = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main key={location.pathname} className="min-h-screen flex flex-col overflow-x-hidden">
        <div className="flex-grow isolate">
          <Outlet />
        </div>
      </main>
      <FeedbackWidget />
      <WhatsAppButton />
      <Footer />
    </>
  );
};

export default MainLayout;
