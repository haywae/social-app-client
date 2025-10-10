import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {Icon, MenuIcon, SearchIcon, AddIcon} from '../../assets/icons';

// --- Part 1: Testing the Base Icon's Behavior (implicitly) ---
describe('Icon Component Behavior', () => {
  it('should correctly merge classNames', () => {
    render(<MenuIcon />);
    const icon = screen.getByTestId('icon-base');
    expect(icon).toHaveClass('svg-icon menu-icon');
  });

  it('should render the correct path as children', () => {
    const { container } = render(<SearchIcon />);
    // Check if the <path> element exists inside the SVG
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    // Check if the path data 'd' attribute is correct
    expect(path).toHaveAttribute(
      'd',
      'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
    );
  });

  it('should pass additional SVG props down to the svg element', () => {
    // A custom component for this specific test
    const TestIcon = () => (
      <Icon className="test-icon" width="50" height="50" aria-label="Test">
        <path d="M12 12h-1v-1h1v1Z" />
      </Icon>
    );

    render(<TestIcon />);
    const icon = screen.getByTestId('icon-base');

    expect(icon).toHaveAttribute('width', '50');
    expect(icon).toHaveAttribute('height', '50');
    expect(icon).toHaveAttribute('aria-label', 'Test');
  });
});

// --- Part 2: Snapshot testing for each specific icon ---

describe('Specific Icon Components', () => {
  const icons = [
    { Component: MenuIcon, name: 'MenuIcon' },
    { Component: SearchIcon, name: 'SearchIcon' },
    { Component: AddIcon, name: 'AddIcon' },
  ];

  it.each(icons)('should render $name correctly', ({ Component }) => {
    const { container } = render(<Component />);
    // Snapshot tests are great for ensuring visual consistency of presentational components.
    expect(container.firstChild).toMatchSnapshot();
  });
});
