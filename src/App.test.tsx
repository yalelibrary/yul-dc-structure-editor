import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import CanvasImage from './components/CanvasImage';
import EditableText from './components/EditableText';
import ImageCanvases from './components/ImageCanvases';
import LaunchModal from './components/LaunchModal';
import TopHeader from './components/TopHeader';
import TreeStructure from './components/TreeStructure';
import { ManifestStructureInfo } from './utils/IIIFUtils';

beforeEach(() => {
  // IntersectionObserver isn't available in test environment
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

test('renders Canvas Image', () => {
  const {container} = render(<CanvasImage selected={false} info={{
    label: 'example label',
    imageId: '123',
    canvasId: '456',
    oid: '789',
    thumbnail: 'logo.svg',
    index: 0
  }} maxWidthHeight={0} />)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const itemLabel = container.getElementsByClassName('item-label');
  expect(itemLabel.length).toBe(1)
});

test('renders Editable Text', () => {
  render(<EditableText onSave={function (value: string): void {
    throw new Error('Function not implemented.');
  } } defaultValue={'example'} />)
  act( () => {
    ReactTestUtils.Simulate.doubleClick(screen.getAllByText('example')[0])
  })
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

test('renders Image Canvas', () => {
  const {container} = render(<ImageCanvases selectedCanvasIds={[]} canvasInfo={[]} maxWidthHeight={0} onShowCanvas={function (id: string): void {
    throw new Error('Function not implemented.');
  } } />)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const canvases = container.getElementsByClassName('canvases');
  expect(canvases.length).toBe(1)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const imageList = container.getElementsByClassName('image-list');
  expect(imageList.length).toBe(1)
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const canvasesFooter = container.getElementsByClassName('canvases-footer');
  expect(canvasesFooter.length).toBe(1)
});

test('renders Launch Modal', () => {
  render(<LaunchModal isModalVisible={true} setIsModalVisible={function (value: boolean): void {
      throw new Error('Function not implemented.');
    } } />)
  const apiInput = screen.getByRole('textbox', { name: /API Key/i });
  expect(apiInput).toBeInTheDocument();
  const manifestInput = screen.getByRole('textbox', { name: /Manifest/i });
  expect(manifestInput).toBeInTheDocument();
  const closeButton = screen.getByRole('button', { name: /close/i });
  expect(closeButton).toBeInTheDocument();
  const cancelButton = screen.getByRole('button', { name: /Cancel/i });
  expect(cancelButton).toBeInTheDocument();
  const okButton = screen.getByRole('button', { name: /OK/i });
  expect(okButton).toBeInTheDocument();
});

test('renders Top Header', () => {
  render(<TopHeader addRangeEnabled={false} addCanvasEnabled={false} deleteEnabled={false} saveManifest={false} showOpenManifest={true} manifestUrl={''} onOpenModal={function (): void {
    throw new Error('Function not implemented.');
  } } onAddRange={function (): void {
    throw new Error('Function not implemented.');
  } } onAddCanvas={function (): void {
    throw new Error('Function not implemented.');
  } } onDelete={function (): void {
    throw new Error('Function not implemented.');
  } } onSubmit={function (): void {
    throw new Error('Function not implemented.');
  } } />);
  const getManifestButton = screen.getByRole('button', { name: /Get Manifest/i });
  expect(getManifestButton).toBeInTheDocument();
  const rangeButton = screen.getByRole('button', { name: /Range/i });
  expect(rangeButton).toBeInTheDocument();
  const canvasButton = screen.getByRole('button', { name: /Canvas/i });
  expect(canvasButton).toBeInTheDocument();
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  expect(deleteButton).toBeInTheDocument();
  const submitButton = screen.getByRole('button', { name: /Submit/i });
  expect(submitButton).toBeInTheDocument();
});

test('renders Tree Structure', () => {
  render(<TreeStructure structureInfo={[]} selectedKeys={[]} expandedKeys={[]} onStructureInfoChange={function (structureInfo: ManifestStructureInfo[]): void {
    throw new Error('Function not implemented.');
  } } onSelectedKeysChange={function (keys: string[]): void {
    throw new Error('Function not implemented.');
  } } onExpandedKeysChange={function (keys: string[]): void {
    throw new Error('Function not implemented.');
  } } onShowCanvas={function (id: string): void {
    throw new Error('Function not implemented.');
  } }/>)
  const treeStructure = screen.getByRole('tree')
  expect(treeStructure).toBeInTheDocument();
});
