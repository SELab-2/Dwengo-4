import React from 'react';
import { render, screen } from '@testing-library/react';
import BoxBorder from '@/components/shared/BoxBorder';

describe('BoxBorder', () => {
  it('renders children correctly', () => {
    render(
      <BoxBorder>
        <p>Test Content</p>
      </BoxBorder>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies the default classes', () => {
    render(
      <BoxBorder>
        <p>Check Classes</p>
      </BoxBorder>,
    );
    const box = screen.getByText('Check Classes').parentElement;
    expect(box).toHaveClass('border-medium');
    expect(box).toHaveClass('py-10');
    expect(box).toHaveClass('px-10');
  });

  it('applies extraClasses prop', () => {
    render(
      <BoxBorder extraClasses="bg-red-500">
        <span>With Extra Class</span>
      </BoxBorder>,
    );
    const box = screen.getByText('With Extra Class').parentElement;
    expect(box).toHaveClass('bg-red-500');
  });

  it('passes through additional props (e.g., id)', () => {
    render(
      <BoxBorder id="custom-id">
        <div>Prop Test</div>
      </BoxBorder>,
    );
    const box = screen.getByText('Prop Test').parentElement;
    expect(box).toHaveAttribute('id', 'custom-id');
  });

  it('merges extraClasses with default classes', () => {
    render(
      <BoxBorder extraClasses="custom-class">
        <p>Merge Classes</p>
      </BoxBorder>,
    );
    const box = screen.getByText('Merge Classes').parentElement;
    expect(box).toHaveClass('border-medium', 'py-10', 'px-10', 'custom-class');
  });
});
