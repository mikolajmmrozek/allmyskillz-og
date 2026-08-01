import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LanguageProvider } from '@/lib/i18n';

// Public pages
import Home from '@/pages/Home';
import PublicLayout from '@/components/site/PublicLayout';
import About from '@/pages/site/About';
import Projects from '@/pages/site/Projects';
import ProjectDetail from '@/pages/site/ProjectDetail';
import Offers from '@/pages/site/Offers';
import OfferDetail from '@/pages/site/OfferDetail';
import News from '@/pages/site/News';
import PostDetail from '@/pages/site/PostDetail';
import Shop from '@/pages/site/Shop';
import ProductDetail from '@/pages/site/ProductDetail';
import Contact from '@/pages/site/Contact';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Admin pages
import AdminLayout from '@/pages/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import MediaLibrary from '@/pages/admin/MediaLibrary';
import Messages from '@/pages/admin/Messages';
import Settings from '@/pages/admin/Settings';
import Homepage from '@/pages/admin/Homepage';
import Navigation from '@/pages/admin/Navigation';
import CollectionList from '@/components/admin/CollectionList';
import CollectionEditor from '@/components/admin/CollectionEditor';

const CollectionListPage = () => {
  const { entity } = useParams();
  return <CollectionList entityName={entity} />;
};
const CollectionEditorPage = () => {
  const { entity } = useParams();
  return <CollectionEditor entityName={entity} />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/:slug" element={<OfferDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<PostDetail />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="homepage" element={<Homepage />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="collection/:entity" element={<CollectionListPage />} />
          <Route path="collection/:entity/new" element={<CollectionEditorPage />} />
          <Route path="collection/:entity/:id" element={<CollectionEditorPage />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App