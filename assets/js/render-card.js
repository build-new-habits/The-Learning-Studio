/* ==========================================================================
   The Learning Studio — Digital Practice Card renderer
   20/07/26 v1

   Fetches a single card JSON file (validated against data/card.schema.json)
   and renders it into the container carrying [data-card-src]. Renders only
   the fields defined in the schema — no narrative content is invented here.

   This is intentionally generic so future card pages can reuse it by
   pointing a container at a different JSON file. It does not perform any
   routing, discovery or Finder logic — it renders exactly one card.
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

  function list(items, listClass) {
    var ul = el('ul', { class: listClass || 'practice-card__list' });
    items.forEach(function (item) {
      ul.appendChild(text('li', null, item));
    });
    return ul;
  }

  function tagList(items) {
    var ul = el('ul', { class: 'practice-card__tags' });
    items.forEach(function (item) {
      var li = el('li');
      li.appendChild(text('span', { class: 'practice-card__tag' }, item));
      ul.appendChild(li);
    });
    return ul;
  }

  function section(headingText, contentNode) {
    var wrap = el('section', { class: 'practice-card__section' });
    wrap.appendChild(text('h3', { class: 'practice-card__heading' }, headingText));
    wrap.appendChild(contentNode);
    return wrap;
  }

  function renderLearningLenses(lenses) {
    var wrap = el('div');
    var lensLabels = {
      accessibility: 'Accessibility',
      inclusive_practice: 'Inclusive practice',
      trauma_informed: 'Trauma-informed',
      udl: 'UDL',
      evidence_informed: 'Evidence-informed'
    };
    var order = ['accessibility', 'inclusive_practice', 'trauma_informed', 'udl', 'evidence_informed'];
    order.forEach(function (key) {
      if (lenses[key] && lenses[key].length) {
        var sub = el('div', { class: 'practice-card__lens' });
        sub.appendChild(text('h4', { class: 'practice-card__heading' }, lensLabels[key]));
        sub.appendChild(list(lenses[key]));
        wrap.appendChild(sub);
      }
    });
    return wrap;
  }

  function renderCard(container, data) {
    container.innerHTML = '';
    container.appendChild(text('p', { class: 'practice-card__eyebrow' }, 'Digital Inclusion'));
    container.appendChild(text('h2', { class: 'practice-card__title' }, data.title));

    if (data.staff_situations && data.staff_situations.length) {
      container.appendChild(section('Staff situation', list(data.staff_situations)));
    }

    if (data.underlying_needs && data.underlying_needs.length) {
      container.appendChild(section('Underlying digital need', list(data.underlying_needs)));
    }

    if (data.digital_practices && data.digital_practices.length) {
      container.appendChild(section('Digital practices', tagList(data.digital_practices)));
    }

    if (data.learning_lenses) {
      container.appendChild(section('Learning lenses', renderLearningLenses(data.learning_lenses)));
    }

    if (data.framework_alignment && data.framework_alignment.length) {
      container.appendChild(section('Framework alignment', list(data.framework_alignment)));
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
    var container = document.querySelector('[data-card-src]');
    if (!container) {
      return;
    }
    var src = container.getAttribute('data-card-src');

    fetch(src)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Card data could not be loaded (' + response.status + ')');
        }
        return response.json();
      })
      .then(function (data) {
        renderCard(container, data);
      })
      .catch(function (err) {
        renderError(container, 'Sorry — this card could not be loaded. ' + err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
