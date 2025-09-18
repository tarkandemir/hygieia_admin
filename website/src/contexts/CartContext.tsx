'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ICartItem, ICart, IProduct } from '@/types';

interface CartContextType {
  cart: ICart;
  addToCart: (product: IProduct, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: IProduct; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: ICart };

const initialCart: ICart = {
  items: [],
  subtotal: 0,
  taxAmount: 0,
  shippingCost: 0,
  totalAmount: 0,
};

function calculateTotals(items: ICartItem[]): Pick<ICart, 'subtotal' | 'taxAmount' | 'shippingCost' | 'totalAmount'> {
  // Use proper floating point arithmetic
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100; // Prices already include VAT
  const taxAmount = 0; // No additional VAT calculation needed
  const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over 500 TL
  const totalAmount = Math.round((subtotal + shippingCost) * 100) / 100; // Total = products + shipping (no extra VAT)


  return {
    subtotal,
    taxAmount,
    shippingCost,
    totalAmount,
  };
}

function cartReducer(state: ICart, action: CartAction): ICart {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.productId === product._id);
      
      let newItems: ICartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item with stock control
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = Math.min(item.quantity + quantity, product.stock); // Stock control
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: Math.round(newQuantity * item.unitPrice * 100) / 100,
            };
          }
          return item;
        });
      } else {
        // Add new item with stock control
        const validQuantity = Math.min(quantity, product.stock); // Stock control
        const newItem: ICartItem = {
          productId: product._id,
          product,
          quantity: validQuantity,
          unitPrice: product.retailPrice,
          totalPrice: Math.round(validQuantity * product.retailPrice * 100) / 100,
        };
        newItems = [...state.items, newItem];
      }

      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.productId !== action.payload.productId);
      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId } });
      }

      const newItems = state.items.map(item => {
        if (item.productId === productId) {
          // Apply stock control when updating quantity
          const validQuantity = Math.min(quantity, item.product.stock);
          return {
            ...item,
            quantity: validQuantity,
            totalPrice: Math.round(validQuantity * item.unitPrice * 100) / 100,
          };
        }
        return item;
      });

      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'CLEAR_CART':
      return initialCart;

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hygieia-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hygieia-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: IProduct, quantity: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
