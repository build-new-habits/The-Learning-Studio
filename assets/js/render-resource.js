/* ==========================================================================
   The Learning Studio — Resource renderer
   21/07/26 v1 — Session 10

   Fetches a single resource JSON file (validated against
   data/resource.schema.json) and renders it into the container carrying
   [data-resource-src]. Renders only the fields defined in the schema —
   no narrative content is invented here.

   Deliberately mirrors assets/js/render-card.js's structure so the two
   renderers stay easy to compare and maintain side by side. It does not
   perform any routing, discovery or Finder logic — it renders exactly
   one resource.
   ========================================================================== */

(function () {
  'use strict';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) {
      if (child) {
        node.appendChild(child);
      }
    });
    return node;
  }

  function text(tag, attrs, textContent) {
    var node = el(tag, attrs);
    node.textContent = textContent;
    return node;
  }

  function orderedList(items) {
    var ol = el('ol', { class: 'practice-card__list' });
    items.forEach(function (item) {
      ol.appendChild(text('li', null, item));
    });
    return ol;
  }

  function section(headingText, contentNode) {
    var wrap = el('section', { class: 'practice-card__section' });
    wrap.appendChild(text('h3', { class: 'practice-card__heading' }, headingText));
    wrap.appendChild(contentNode);
    return wrap;
  }

  function renderResource(container, data) {
    container.innerHTML = '';
    container.appendChild(text('p', { class: 'practice-card__eyebrow' }, 'Resource'));
    container.appendChild(text('h2', { class: 'practice-card__title' }, data.title));

    if (data.what_it_is) {
      container.appendChild(section('What it is', text('p', null, data.what_it_is)));
    }

    if (data.why_use_it) {
      container.appendChild(section('Why use it', text('p', null, data.why_use_it)));
    }

    if (data.how_to && data.how_to.length) {
      container.appendChild(section('How to', orderedList(data.how_to)));
    }

    var meta = el('dl', { class: 'practice-card__meta' });
    var status = el('div');
    status.appendChild(text('dt', { class: 'visually-hidden' }, 'Review status'));
    status.appendChild(text('span', { class: 'practice-card__status' }, data.review_status));
    meta.appendChild(status);

    if (data.source_area) {
      var sourceWrap = el('div');
      sourceWrap.appendChild(text('dt', null, 'Source area'));
      sourceWrap.appendChild(text('dd', null, data.source_area));
      meta.appendChild(sourceWrap);
    }

    if (data.last_reviewed) {
      var reviewedWrap = el('div');
      reviewedWrap.appendChild(text('dt', null, 'Last reviewed'));
      reviewedWrap.appendChild(text('dd', null, data.last_reviewed));
      meta.appendChild(reviewedWrap);
    }

    container.appendChild(meta);
  }

  function renderError(container, message) {
    container.innerHTML = '';
    container.appendChild(text('p', { role: 'alert' }, message));
  }

  function init() {
    var container = document.querySelector('[data-resource-src]');
    if (!container) {
      return;
    }
    var src = container.getAttribute('data-resource-src');

    fetch(src)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Resource data could not be loaded (' + response.status + ')');
        }
        return response.json();
      })
      .then(function (data) {
        renderResource(container, data);
      })
      .catch(function (err) {
        renderError(container, 'Sorry — this resource could not be loaded. ' + err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
