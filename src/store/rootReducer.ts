import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './modules/auth/auth.slice';
import contactsReducer from './modules/contacts/contacts.slice';
import productsReducer from './modules/products/products.slice';
import ordersReducer from './modules/orders/orders.slice';
import adminReducer from './modules/admin/admin.slice';
import sidebarBadgesReducer from './modules/sidebarBadges/sidebarBadges.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactsReducer,
  products: productsReducer,
  orders: ordersReducer,
  admin: adminReducer,
  sidebarBadges: sidebarBadgesReducer,
});

export type RootReducer = typeof rootReducer;

export default rootReducer;
