import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react draw button', () => {
  render(<App />);
  const linkElement = screen.getByText(/Draw lots/i);
  expect(linkElement).toBeInTheDocument();
});
