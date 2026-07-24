/* ==========================================================================
   The Learning Studio — Digital Practice Card renderer
   24/07/26 v3 — Session 28: related_cards now renders as a "Related
   resources" section of real links, placed after Framework alignment and
   before the meta/status footer. Card IDs are unique across every
   pyramid-layer folder (enforced by scripts/validate.js), not just the
   current one, so each related ID is resolved by trying the current
   folder first, then the other known card folders in CARD_DIRS. Empty or
   absent related_cards renders nothing — same graceful-degradation
   pattern as every other optional field on this page.
   21/07/26 v2 — Session 10: digital_practices tags now render as a link
   to /content/resources/<id>.html when a matching entry exists in the
   card's optional digital_practice_resources map. Tags with no match
   degrade to the original plain-tag rendering, unchanged.

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

  function tagList(items, resourceMap) {
    var ul = el('ul', { class: 'practice-card__tags' });
    items.forEach(function (item) {
      var li = el('li');
      var resourceId = resourceMap ? resourceMap[item] : null;
      if (resourceId) {
        li.appendChild(text('a', {
          class: 'practice-card__tag practice-card__tag--linked',
          href: '../resources/' + resourceId + '.html'
        }, item));
      } else {
        li.appendChild(text('span', { class: 'practice-card__tag' }, item));
      }
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

  // Card content folders under /content. Card IDs are unique across all of
  // these (enforced by scripts/validate.js), so a related_cards ID may live
  // in a different folder to the current card. Add new pyramid-layer folder
  // names here as they're introduced.
  var CARD_DIRS = ['digital-foundations', 'digital-inclusion'];

  function currentCardDir() {
    var parts = window.location.pathname.split('/');
    return parts[parts.length - 2] || '';
  }

  // Resolves a related_cards ID to { href, title } by fetching its JSON.
  // Tries the current folder first (the common, same-layer case), then
  // falls back to the other known card folders for cross-layer references.
  // Rejects if the ID cannot be resolved anywhere.
  function resolveRelatedCard(id) {
    function fetchCard(jsonUrl, htmlHref) {
      return fetch(jsonUrl).then(function (response) {
        if (!response.ok) {
          throw new Error('not found');
        }
        return response.json();
      }).then(function (data) {
        return { href: htmlHref, title: data.title || id };
      });
    }

    var ownDir = currentCardDir();
    var attempt = fetchCard(id + '.json', id + '.html');

    CARD_DIRS.filter(function (dir) {
      return dir !== ownDir;
    }).forEach(function (dir) {
      attempt = attempt.catch(function () {
        return fetchCard('../' + dir + '/' + id + '.json', '../' + dir + '/' + id + '.html');
      });
    });

    return attempt;
  }

  // Builds the "Related resources" section once every ID has resolved (or
  // failed). Resolves to a section node, or null if nothing resolved —
  // callers render nothing in that case, same as any other empty field.
  function renderRelatedCards(ids) {
    var ul = el('ul', { class: 'practice-card__list' });

    var lookups = ids.map(function (id) {
      return resolveRelatedCard(id).then(function (info) {
        var li = el('li');
        li.appendChild(text('a', { href: info.href }, info.title));
        ul.appendChild(li);
      }).catch(function () {
        // Could not resolve this related card — skip it silently and
        // let the others render.
      });
    });

    return Promise.all(lookups).then(function () {
      return ul.children.length ? section('Related resources', ul) : null;
    });
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
      container.appendChild(section('Digital practices', tagList(data.digital_practices, data.digital_practice_resources)));
    }

    if (data.learning_lenses) {
      container.appendChild(section('Learning lenses', renderLearningLenses(data.learning_lenses)));
    }

    if (data.framework_alignment && data.framework_alignment.length) {
      container.appendChild(section('Framework alignment', list(data.framework_alignment)));
    }

    // Placeholder is appended now so DOM order stays correct (after
    // Framework alignment, before the meta footer) even though resolving
    // each related card is asynchronous. If related_cards is empty or
    // absent, nothing is ever appended into it.
    var relatedWrap = el('div', { 'data-related-cards': '' });
    container.appendChild(relatedWrap);
    if (data.related_cards && data.related_cards.length) {
      renderRelatedCards(data.related_cards).then(function (sectionNode) {
        if (sectionNode) {
          relatedWrap.appendChild(sectionNode);
        }
      });
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
