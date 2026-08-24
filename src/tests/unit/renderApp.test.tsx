// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';

describe('App Render Safety Check', () => {
  it('renders App without throwing Invalid Hook Call', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });
});
