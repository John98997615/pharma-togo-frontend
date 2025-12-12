// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  const appElement = document.querySelector('.min-h-screen');
  expect(appElement).toBeInTheDocument();
});