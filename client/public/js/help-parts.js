// Image map hotspot rescaling and mailbox cutaway interactive explanations (Module 3 jQuery)
$(document).ready(function () {
  const partsData = {
    door: { num: 1, title: 'Door and lock', desc: 'Locks when you press Lock. Opens only with the right pickup code.' },
    camera: { num: 2, title: 'Camera', desc: 'Takes a photo of what is inside. A small flash helps in the dark.' },
    sensor: { num: 3, title: 'Parcel sensor', desc: 'Notices when a parcel is dropped in.' },
    shake: { num: 4, title: 'Shake sensor', desc: 'Warns you if someone shakes or hits the mailbox. Extra feature.' }
  };

  const origW = 480;
  const origH = 360;

  $('map[name="mailbox-parts"] area').each(function () {
    $(this).data('orig-coords', $(this).attr('coords'));
  });

  function rescale() {
    const $img = $('#mailbox-base');
    const curW = $img.width() || origW;
    const curH = $img.height() || origH;
    const sx = curW / origW;
    const sy = curH / origH;

    $('map[name="mailbox-parts"] area').each(function () {
      const orig = $(this).data('orig-coords');
      if (!orig) return;
      const rescaled = orig.split(',').map(Number).map((v, i) => Math.round(i % 2 === 0 ? v * sx : v * sy));
      $(this).attr('coords', rescaled.join(','));
    });
  }

  $(window).on('resize', rescale);
  setTimeout(rescale, 250);

  // Spot selection via map area or number buttons
  $('map[name="mailbox-parts"] area, .number-btn').on('click', function (e) {
    e.preventDefault();
    const key = $(this).data('part');
    const data = partsData[key];
    if (!data) return;

    $('.number-btn').removeClass('active');
    $(`.number-btn[data-part="${key}"]`).addClass('active');

    $('#info-display-box').fadeOut(120, function () {
      $(this).html(
        '<div class="fw-semibold text-dark mb-1">' + data.num + '. ' + data.title + '</div>' +
        '<div class="text-secondary small mb-1">' + data.desc + '</div>' +
        '<div class="text-muted small" style="font-size:0.75rem">Simulated in this demo</div>'
      ).fadeIn(180);
    });
  });
});
