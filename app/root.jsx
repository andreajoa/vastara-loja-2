import {useNonce, Analytics, getShopAnalytics} from '@shopify/hydrogen';
import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from 'react-router';
import appStyles from '~/styles/app.css?url';
import {MENU_FRAGMENT} from '~/lib/fragments';
import Layout from '~/components/Layout';



export const links = () => [
  {rel:'stylesheet', href:appStyles},
  {rel:'preconnect', href:'https://fonts.googleapis.com'},
  {rel:'preconnect', href:'https://fonts.gstatic.com', crossOrigin:'anonymous'},
  {rel:'preload', href:'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap', as:'style', onLoad:"this.onload=null;this.rel='stylesheet'"},
];

export const meta = () => [
  {name: 'robots', content: 'index, follow'},
];


