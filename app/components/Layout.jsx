import {useState, createContext, useContext, useCallback} from 'react';
import {useFetcher} from 'react-router';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export default function Layout({children, header, footer, cart: initialCart}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(initialCart || null);
  const fetcher = useFetcher();

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback((variantId, quantity = 1) => {
    fetcher.submit(
      {variantId, quantity: String(quantity), action: 'add'},
      {method: 'POST', action: '/cart'}
    );
    setIsCartOpen(true);
  }, [fetcher]);

  const removeFromCart = useCallback((lineId) => {
    fetcher.submit({lineId, action: 'remove'}, {method: 'POST', action: '/cart'});
  }, [fetcher]);

  const updateQuantity = useCallback((lineId, quantity) => {
    fetcher.submit(
      {lineId, quantity: String(quantity), action: 'update'},
      {method: 'POST', action: '/cart'}
    );
  }, [fetcher]);

  const liveCart = fetcher.data?.cart || cart;
  const lines = liveCart?.lines?.nodes || [];
  const totalQuantity = liveCart?.totalQuantity || 0;

  return (
    <CartContext.Provider value={{openCart, closeCart, addToCart, removeFromCart, updateQuantity, cart: liveCart, lines, totalQuantity}}>
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <Header header={header} cartCount={totalQuantity} onCartOpen={openCart} />
        <main style={{flex:1}}>{children}</main>
        <Footer footer={footer} />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={closeCart}
          lines={lines}
          cart={liveCart}
          onRemove={removeFromCart}
          onUpdate={updateQuantity}
        />
      </div>
    </CartContext.Provider>
  );
}
