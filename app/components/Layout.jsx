import {createContext, useContext, useState, useEffect} from 'react';
import {useRouteLoaderData, useLocation, useFetchers} from 'react-router';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export default function Layout({children, header, footer}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fetcherCart, setFetcherCart] = useState(null);
  const location = useLocation();

  const rootData = useRouteLoaderData('root');
  const rootCart = rootData?.cart ?? null;
  const cart = fetcherCart ?? rootCart;
  const totalQuantity = cart?.totalQuantity || 0;

  // Open cart when ?cart=open is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('cart') === 'open') {
      setIsCartOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('cart');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [location.search]);

  const fetchers = useFetchers();
  useEffect(() => {
    const done = fetchers.find(
      f => f.formAction?.includes('/cart') && f.state === 'idle' && f.data?.cart
    );
    if (done) {
      setFetcherCart(done.data.cart);
      setIsCartOpen(true);
    }
  }, [fetchers]);

  function openCart(cartData) {
    if (cartData && cartData.lines) setFetcherCart(cartData);
    setIsCartOpen(true);
  }

  return (
    <CartContext.Provider value={{
      cart,
      totalQuantity,
      openCart,
      closeCart: () => setIsCartOpen(false),
    }}>
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <Header header={header} cartCount={totalQuantity} onCartOpen={() => setIsCartOpen(true)} />
        <main style={{flex:1}}>{children}</main>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} />
        <Footer footer={footer} />
      </div>
    </CartContext.Provider>
  );
}

export {Aside, useAside} from './Aside';
