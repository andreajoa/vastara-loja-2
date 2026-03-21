import {createContext, useContext, useState, useEffect} from 'react';
import {useRouteLoaderData, useLocation, useFetchers} from 'react-router';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export default function Layout({children, header, footer}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const rootData = useRouteLoaderData('root');
  const rootCart = rootData?.cart ?? null;

  // Use fetcher cart data immediately (before root revalidates)
  const fetchers = useFetchers();
  const cartFetcher = fetchers.find(f => f.formAction?.includes('/cart') && f.data?.cart);
  const cart = cartFetcher?.data?.cart ?? rootCart;
  const totalQuantity = cart?.totalQuantity || 0;

  // Open cart when ?cart=open is in URL (fallback for non-JS)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('cart') === 'open') {
      setIsCartOpen(true);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('cart');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [location.search]);

  // Open drawer when add-to-cart fetcher completes
  useEffect(() => {
    if (cartFetcher) {
      setIsCartOpen(true);
    }
  }, [cartFetcher]);

  return (
    <CartContext.Provider value={{
      cart,
      totalQuantity,
      openCart: () => setIsCartOpen(true),
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
