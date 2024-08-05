import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Home/Home';
import Main from './components/Main/Main';
import Cart from './components/Cart/Cart';
import Saved from './components/Saved/Saved';
import { Loader, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/carousel/styles.css';
import '@mantine/core/styles.css';
import Checkout from './components/Checkout/Checkout';
import Profile from './components/Profile/Profile';
import Catalog from './components/Catalog/Catalog';
import Product from './components/Product/Product';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { CssLoader } from './CssLoader';

function App() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <ModalsProvider
          theme={{
            components: {
              Loader: Loader.extend({
                defaultProps: {
                  loaders: { ...Loader.defaultLoaders, custom: CssLoader },
                  type: 'custom',
                },
              }),
            },
          }}>
          <Notifications position="top-right" zIndex={1000} />
          <Routes>
            <Route path="/" element={<Home />}>
              <Route index element={<Main />} />
              <Route path="cart" element={<Cart />} />
              <Route path="saved" element={<Saved />} />
              <Route path='catalog' element={<Catalog />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="profile" element={<Profile />} />
              <Route path='/product' element={<Product />} />
            </Route>
          </Routes>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
