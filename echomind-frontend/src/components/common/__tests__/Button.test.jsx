import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant prop correctly', () => {
    render(<Button variant="outlined">Outlined Button</Button>);
    const button = screen.getByText('Outlined Button');
    expect(button).toHaveClass('MuiButton-outlined');
  });

  test('applies color prop correctly', () => {
    render(<Button color="secondary">Secondary Button</Button>);
    const button = screen.getByText('Secondary Button');
    expect(button).toHaveClass('MuiButton-colorSecondary');
  });

  test('applies size prop correctly', () => {
    render(<Button size="small">Small Button</Button>);
    const button = screen.getByText('Small Button');
    expect(button).toHaveClass('MuiButton-sizeSmall');
  });

  test('applies fullWidth prop correctly', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByText('Full Width Button');
    expect(button).toHaveClass('MuiButton-fullWidth');
  });

  test('applies disabled prop correctly', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });
});
