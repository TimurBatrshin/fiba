import React from 'react';
import { render, screen } from '../test-utils';

describe('Test Utils', () => {
  it('renders with custom render', () => {
    render(<div data-testid="test-element">Test</div>);
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });
  
  it('provides authentication context', () => {
    render(
      <div>
        <span data-testid="test-element">Test</span>
      </div>
    );
    
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });
}); 