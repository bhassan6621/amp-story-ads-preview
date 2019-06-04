/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {fatal, step} from '../lib/log';
import {isRunningFrom} from '../lib/cli';
import {minify} from 'terser';
import {postcssPlugins} from '../postcss.config';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import fs from 'fs-extra';
import nodeResolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';

const inputConfig = () => ({
  input: 'src/bundles/app.js',
  plugins: [
    postcss({extract: true, plugins: postcssPlugins()}),
    nodeResolve(),
    commonjs(),
    babel({runtimeHelpers: true}),
  ],
});

const outputBundles = [
  {
    file: 'dist/app.js',
    format: 'iife',
    name: 'ampStoryAdPreview',
  },
];

const minifyConfig = {mangle: {toplevel: true}};

const withAllBundles = cb => Promise.all(outputBundles.map(cb));

const minifyBundle = async ({file}) =>
  fs.outputFile(
    file,
    minify((await fs.readFile(file)).toString('utf-8'), minifyConfig).code
  );

export const build = () =>
  step('🚧 Building', async () => {
    const mainBundle = await rollup(inputConfig());
    return withAllBundles(outputBundle => mainBundle.write(outputBundle));
  });

async function main() {
  await build();
  if (!process.env.PROD) {
    return;
  }
  await step('👶 Minifying', () => withAllBundles(minifyBundle));
}

if (isRunningFrom('build.js')) {
  main().catch(fatal);
}
