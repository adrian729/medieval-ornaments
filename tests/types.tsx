import { createRef } from 'react';
import { createDivider, createFrame, createOrnamentImage, findOrnaments, resolveOrnament, assetsPackage, assetsVersion, type Category, type Provenance } from '@ranx729/medieval-ornaments';
import { OrnamentFrame, OrnamentDivider, OrnamentImage } from '@ranx729/medieval-ornaments/react';
import { OrnamentDivider as UnstyledDivider, type OrnamentFrameProps as UnstyledFrameProps } from '@ranx729/medieval-ornaments/react/unstyled';
import '@ranx729/medieval-ornaments/styles.css';
const unstyledProps: UnstyledFrameProps = { design: 'red-berry-vine', size: 33 };
const unstyledExample = <UnstyledDivider design="plate-02-stepped-ribbon" orientation="horizontal" />;
const categories: Category[] = ['floral'];
const source: Provenance | undefined = findOrnaments({ query: 'Hoefnagel' })[0]?.provenance;
const author: string | undefined = findOrnaments({ query: 'adrian729' })[0]?.author;
import { ornament as authoredOrnament } from '@ranx729/medieval-ornaments/designs/rabbit-lutenist-painted';
const individualAuthor: string | undefined = authoredOrnament.author;
// @ts-expect-error Author is immutable optional metadata.
authoredOrnament.author = 'someone-else';
void [author, individualAuthor];
if (source) {
  const sourceRecord: string = source.record_url;
  // @ts-expect-error Provenance is immutable selection metadata.
  source.institution = 'Replacement';
}
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

import { OrnamentImage as FlyingPig, ornament as pigMetadata } from '@ranx729/medieval-ornaments/react/flying-pig';
import { findOrnaments as findIllustrations } from '@ranx729/medieval-ornaments/catalog/illustrations';
const selectedIllustrations = findIllustrations({ subjects: ['rabbit'], categories: ['reading'], facing: 'left', composition: 'single-figure', hasTransparency: true });
const pigsType: 'illustration' = pigMetadata.asset_type;
const boundPig = <FlyingPig size={128} loading="lazy" decoding="async" fetchPriority="low" />;
const dynamicIllustration = <OrnamentImage design="musicians-and-dancers" />;
const scopeImages = selectedIllustrations.map(item => <OrnamentImage key={item.name} design={item.name} />);
// @ts-expect-error Illustrations have no SVG format.
const pigSVG = <FlyingPig format="svg" />;
// @ts-expect-error Illustrations cannot repeat.
const pigDivider = <OrnamentDivider design="flying-pig" />;
// @ts-expect-error Unknown content type.
findOrnaments({ assetType: 'picture' });
// @ts-expect-error Transparency is a boolean filter.
findOrnaments({ hasTransparency: 'true' });
// @ts-expect-error Head direction uses the documented vocabulary.
findOrnaments({ facing: 'up' });
void [pigsType, boundPig, dynamicIllustration, scopeImages, pigSVG, pigDivider];

import { getAssetSource } from '@ranx729/medieval-ornaments/resources';
const sourceUrl: string = getAssetSource("red-berry-vine").base;
void sourceUrl;

import { createFrame as createRosselliFrame, createDivider as createRosselliDivider } from '@ranx729/medieval-ornaments/designs/rosselli-mask-border';
import { OrnamentFrame as RosselliFrame } from '@ranx729/medieval-ornaments/react/rosselli-foliate-border';
createRosselliFrame(document.createElement('div'), {size: 33, format: 'png'});
createRosselliDivider(document.createElement('div'), {orientation: 'horizontal', format: 'webp'});
const rosselli = <RosselliFrame size={33} format="webp" />;
// @ts-expect-error Native raster borders do not invent SVG alternatives.
const rosselliSvg = <RosselliFrame format="svg" />;
// @ts-expect-error The individual border stays bound to its own design.
createRosselliFrame(document.createElement('div'), {design: 'rosselli-foliate-border'});
void [rosselli, rosselliSvg];
