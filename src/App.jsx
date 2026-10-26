
import { ToastContainer } from 'react-toastify';
import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper';
// import configureFakeBackend from './helpers/fake-backend';
import AppRouter from './routes/router';
import '@/assets/scss/app.scss';
// configureFakeBackend();
const App = () => {
return (
 
    <AppProvidersWrapper>
      <ToastContainer
         position="top-right"
         autoClose={3000}
         hideProgressBar={false}
         newestOnTop
         closeOnClick
         pauseOnHover
      />
      <AppRouter />
    </AppProvidersWrapper>

);}
export default App;