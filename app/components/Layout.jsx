import {createContext, useContext, useState} from 'react';
import {useRouteLoaderData} from 'react-router';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export default function Layout({children, header, footer}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Read cart reactively from root loader - this updates when root revalidates
  const rootData = useRouteLoaderData('root');
  const cart = rootData?.cart ?? null;
  const totalQuantity = cart?.totalQuantity || 0;

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
