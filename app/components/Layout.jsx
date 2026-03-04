import {createContext, useContext} from 'react';
import {useRouteLoaderData} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import {Aside, useAside} from './Aside';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

function LayoutInner({children, header, footer}) {
  const {type, open, close} = useAside();
  const rootData = useRouteLoaderData('root');
  const cart = rootData?.cart ?? null;
  const totalQuantity = cart?.totalQuantity ?? 0;
  const isCartOpen = type === 'cart';

  // Use cart route data for updates
  const cartData = useRouteLoaderData('routes/($locale).cart');
  const cartRouteData = cartData?.cart ?? cart;

  return (
    <CartContext.Provider value={{
      openCart: () => open('cart'),
      closeCart: close,
      cart: cartRouteData,
      totalQuantity: cartRouteData?.totalQuantity ?? totalQuantity,
    }}>
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <Header header={header} cartCount={cartRouteData?.totalQuantity ?? totalQuantity} onCartOpen={() => open('cart')} />
        <main style={{flex:1}}>{children}</main>
        <CartDrawer isOpen={isCartOpen} onClose={close} cart={cartRouteData} />
        <Footer footer={footer} />
      </div>
    </CartContext.Provider>
  );
}

export default function Layout({children, header, footer}) {
  return (
    <Aside.Provider>
      <LayoutInner header={header} footer={footer}>
        {children}
      </LayoutInner>
    </Aside.Provider>
  );
}
