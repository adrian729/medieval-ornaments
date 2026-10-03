import { createRef } from 'react';
import { createDivider, createFrame, createOrnamentImage, findOrnaments, resolveOrnament, assetsPackage, assetsVersion, type Category } from '@ranx729/medieval-ornaments';
import { OrnamentFrame, OrnamentDivider, OrnamentImage } from '@ranx729/medieval-ornaments/react';
import { OrnamentDivider as UnstyledDivider, type OrnamentFrameProps as UnstyledFrameProps } from '@ranx729/medieval-ornaments/react/unstyled';
import '@ranx729/medieval-ornaments/styles.css';
const unstyledProps: UnstyledFrameProps = { design: 'red-berry-vine', size: 33 };
const unstyledExample = <UnstyledDivider design="plate-02-stepped-ribbon" orientation="horizontal" />;
const categories: Category[] = ['floral'];
const artworkRevision: string = `${assetsPackage}@${assetsVersion}`;
findOrnaments({ use: 'frame', categories, query: 'gold' });
const discoveredDividers = findOrnaments({ use: 'divider' }).map(item => <OrnamentDivider key={item.name} design={item.name} />);
const discoveredImages = findOrnaments({ use: 'image' }).map(item => <OrnamentImage key={item.name} design={item.name} />);
const divider = createDivider(document.createElement('div'), { design: 'plate-02-stepped-ribbon' });
divider.update({ orientation: 'horizontal', length: '100%', pixelRatio: 1 });
divider.update({ loading: 'lazy' });
createFrame(document.createElement('article'), { design: 'red-berry-vine', size: 33 });
createOrnamentImage(document.createElement('img'), { design: 'floral-bird-panel-blue', alt: '', loading: 'lazy', decoding: 'async', fetchPriority: 'low' });
resolveOrnament('divider', { design: 'red-berry-vine', orientation: 'original' });
const example = <OrnamentFrame design="red-berry-vine" loading="lazy" ref={createRef<HTMLDivElement>()} style={{ padding: 20, '--my-color': 'red' }}>
  <input defaultValue="hello" />
  <OrnamentDivider design="plate-02-stepped-ribbon" orientation="horizontal" length="100%" />
  <OrnamentImage design="floral-bird-panel-blue" size={128} loading="lazy" ref={createRef<HTMLImageElement>()} />
</OrnamentFrame>;
// @ts-expect-error Whole decorations cannot repeat.
createDivider(document.createElement('div'), { design: 'floral-bird-panel-blue' });
// @ts-expect-error Frames do not have a divider orientation.
const badFrame = <OrnamentFrame design="red-berry-vine" orientation="vertical" />;
// @ts-expect-error Use normalized size rather than an overriding image source.
const badImage = <OrnamentImage design="floral-bird-panel-blue" src="override.webp" />;
// @ts-expect-error Only frames take children.
const badDivider = <OrnamentDivider design="red-berry-vine">content</OrnamentDivider>;
// @ts-expect-error Unknown catalog names fail at compilation.
const badName = <OrnamentDivider design="not-real" />;
// @ts-expect-error Image decoding is not a CSS-frame option.
const badDecoding = <OrnamentFrame design="red-berry-vine" decoding="async" />;
// @ts-expect-error Loading must be eager or lazy.
divider.update({ loading: 'auto' });
void [example, badFrame, badImage, badDivider, badName, discoveredDividers, discoveredImages, unstyledProps, unstyledExample];

import { OrnamentFrame as BerryFrame, OrnamentDivider as BerryDivider } from '@ranx729/medieval-ornaments/react/red-berry-vine';
import { OrnamentImage as GoldImage } from '@ranx729/medieval-ornaments/react/unstyled/gold-scroll-with-blue-bellflowers';
import { createDivider as createBerryDivider, resolveOrnament as resolveBerry } from '@ranx729/medieval-ornaments/designs/red-berry-vine';
import { findOrnaments as discover } from '@ranx729/medieval-ornaments/catalog';
const selective = <BerryFrame size={33} ref={createRef<HTMLDivElement>()}><input /><BerryDivider orientation="vertical" length={300} /><GoldImage size={128} alt="" /></BerryFrame>;
createBerryDivider(document.createElement('div')).update({ size: 20 });
resolveBerry('frame');
discover({ use: 'image' });
// @ts-expect-error Individual exports are bound to a single design.
const wrongBoundDesign = <BerryDivider design="plate-02-stepped-ribbon" />;
// @ts-expect-error Individual whole-decoration exports have no frame.
import { OrnamentFrame as MissingFrame } from '@ranx729/medieval-ornaments/react/gold-scroll-with-blue-bellflowers';
// @ts-expect-error Image-only design cannot resolve a divider.
import { createDivider as MissingDivider } from '@ranx729/medieval-ornaments/designs/gold-scroll-with-blue-bellflowers';
// @ts-expect-error Frames cannot be resolved as whole images.
resolveBerry('image');
// @ts-expect-error Whole-image loading hints cannot be used on dividers.
const selectiveBadHint = <BerryDivider decoding="sync" />;
void [selective, wrongBoundDesign, selectiveBadHint];
