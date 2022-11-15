import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { act } from 'react-dom/test-utils';
import { fireEvent, queryByText, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import App from './App';

// render buttons

test('renders Get Manifest button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Get Manifest/i });
  expect(buttonElement).toBeInTheDocument();
});

test('renders Range button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Range/i });
  expect(buttonElement).toBeInTheDocument();
});

test('renders Canvas button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Canvas/i });
  expect(buttonElement).toBeInTheDocument();
});

test('renders delete button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /delete/i });
  expect(buttonElement).toBeInTheDocument();
});

test('renders Submit button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Submit/i });
  expect(buttonElement).toBeInTheDocument();
});

// load manifest

test('retrieves a manifest', async () => {

  render(<App />);
  const getManifestButton = screen.getByRole('button', { name: /Get Manifest/i });
  act(() => {
    ReactTestUtils.Simulate.click(getManifestButton);
  });
  
  const manifestInput = screen.getByLabelText('Manifest')
  
  fireEvent.change(manifestInput, {
    target: { value: 'https://iiif.io/api/cookbook/recipe/0024-book-4-toc/manifest.json' }
  });

  // submit form
  const okButton = screen.getByRole('button', { name: /Cancel/i })

  expect(okButton).toBeInTheDocument();
  act( () => {
    // okButton.click()
    ReactTestUtils.Simulate.click(okButton);
  });
  await waitForElementToBeRemoved(() => screen.queryByText(/OK/i));
  
  // acknowledge download
  act(() => {
    ReactTestUtils.Simulate.click(okButton);
  });
  expect(okButton).toBeInTheDocument();

  expect(screen.getByText('Table of Contents')).toBeInTheDocument();
});

// add range

// remove range

// add canvas

// remove canvas

// drag range

// drag canvas

// change range label

// submit back new manifest

