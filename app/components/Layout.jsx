import {createContext, useContext, useState, useEffect} from 'react';
import {useRouteLoaderData, useFetchers} from 'react-router';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export default function Layout({children, header, footer}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const rootData = useRouteLoaderData('root');
  const cart = rootData?.cart ?? null;
  const totalQuantity = cart?.totalQuantity || 0;

  // Watch all fetchers for cart actions - when they complete, the root
  // will have already revalidated (React Router does this automatically
  // for fetcher submissions). We just need to open the cart drawer.
  const fetchers = useFetchers();
  const cartFetchers = fetchers.filter(
    f => f.formAction === '/cart' && f.formData?.get('cartAction') === 'ADD_TO_CART'
  );
  
  // Auto-open cart when an add-to-cart fetcher completes
  useEffect(() => {
    const justFinished = cartFetchers.some(
      f => f.state === 'loading' && f.data?.cart
    );
    if (justFinished) {
      setIsCartOpen(true);
    }
  }, [cartFetchers]);

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
