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
import './amp-story-ad-preview.css';
import {getNamespace} from '../lib/namespace';
import {html, render} from 'lit-html';
import {restartIframeWithDocument} from './utils/document-html';
import {untilAttached} from './utils/until-attached';

const {n} = getNamespace('amp-story-ad-preview');

const defaultIframeSandbox = [
  'allow-scripts',
  'allow-forms',
  'allow-same-origin',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-presentation',
  'allow-top-navigation',
].join(' ');

/**
 * Renders a wrapped iframe that loads an empty document.
 * @return {lit-html/TemplateResult}
 */
function WrappedIframe() {
  return html`
    <div class="${n('wrap')}">
      <iframe
        frameborder="0"
        allowpaymentrequest
        allowfullscreen
        id=${n('iframe')}
        class=${'elevation-4dp' /* still not sure why lol */}
        sandbox=${defaultIframeSandbox}
        title="AMP Story Ad Preview"
        src="/static/empty.html"
      >
      </iframe>
    </div>
  `;
}

export default class AmpStoryAdPreview {
  constructor(win, element) {
    this.win = win;
    this.element = element;

    this.iframePromise_ = untilAttached(this.element, 'iframe');

    render(WrappedIframe(), this.element);
  }

  /**
   * Updates the current preview with full document HTML.
   * @param {string} dirty Dirty document HTML.
   * @return {!Promise<Document>}
   *    Resolves with the preview iframe's document once updated.
   */
  async update(dirty) {
    // TODO: purifyHtml() from ampproject/src/purifier
    return restartIframeWithDocument(await this.iframePromise_, dirty);
  }
}
