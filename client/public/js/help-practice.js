// Interactive 3-step practice flow with jQuery events, traversal, and effects (Module 3 jQuery)
$(document).ready(function () {
  let isDropped = false;
  let isLocked = false;
  let practicePassCode = '';
  let practiceTries = 3;

  // Navigates between practice panels and highlights active step in strip
  function goToStep(stepNum) {
    const $item = $(`.practice-step-item[data-step="${stepNum}"]`);
    $item.addClass('active').siblings().removeClass('active');
    $item.prevAll().addClass('done');
    $item.nextAll().removeClass('done');
    $('.practice-panel').hide();
    $(`#practice-step-${stepNum}`).fadeIn(180);
  }

  $('.practice-step-item, .btn-go-step').on('click', function () {
    const target = $(this).data('step');
    if (target) goToStep(target);
  });

  // Step 1: Drop parcel
  $('#btn-practice-drop').on('click', function () {
    if (isDropped) return;
    isDropped = true;
    $('#track-line-1').css('background', '#1b7f4b');
    $('#track-node-2').addClass('active');
    $('#practice-sentence').text('A parcel was put in the mailbox.');
    $('#stage-led').removeClass('led-green led-red').addClass('led-amber');
    $('#practice-parcel').show().animate({ top: '48.3333%' }, 300);
    $('#btn-practice-lock').prop('disabled', false);
    $(this).prop('disabled', true);
    $('#step-1-next').slideDown(150);
  });

  // Step 1: Lock door
  $('#btn-practice-lock').on('click', function () {
    if (!isDropped || isLocked) return;
    isLocked = true;
    $('#track-line-2').css('background', '#1b7f4b');
    $('#track-node-3').addClass('active');
    $('#practice-sentence').text('The mailbox is locked. Safe inside.');
    $('#stage-led').removeClass('led-amber led-red').addClass('led-green');
    $(this).prop('disabled', true);
  });

  // Step 2: Create pass
  $('#btn-practice-code').on('click', function () {
    const name = ($('#practice-name').val() || '').trim();
    if (!name) {
      $('#practice-code-error').text('Please type a name.').show();
      return;
    }
    $('#practice-code-error').hide();
    practicePassCode = Math.floor(100000 + Math.random() * 900000).toString();
    const formatted = practicePassCode.slice(0, 3) + ' ' + practicePassCode.slice(3);
    $('#generated-code-box').html(
      '<div style="font-size:12px; color:var(--text-2);">Code for ' + $('<div>').text(name).html() + ':</div>' +
      '<div style="font-size:24px; font-weight:700; color:var(--accent); letter-spacing:3px; margin:4px 0;">' + formatted + '</div>' +
      '<div style="font-size:11px; color:var(--muted);">Valid for 30 minutes &bull; 1 use</div>'
    ).slideDown(150);
    $('#step-2-next').slideDown(150);
  });

  // Step 3: Enter code
  $('#btn-practice-collect').on('click', function () {
    const entered = ($('#practice-input-code').val() || '').trim().replace(/\D/g, '');
    const $msg = $('#practice-collect-msg');
    if (!entered || entered.length !== 6) {
      $msg.html('<span class="text-danger">Enter a 6-digit code.</span>').fadeIn(150);
      return;
    }
    if (entered === practicePassCode) {
      $('#track-line-3').css('background', '#1b7f4b');
      $('#track-node-4').addClass('active');
      $('#practice-sentence').text('Parcel picked up. Mailbox is empty.');
      $('#stage-led').removeClass('led-green led-amber led-red');
      $('#practice-parcel').fadeOut(250);
      $('#btn-practice-collect').prop('disabled', true);
      $msg.html('<span class="text-success fw-semibold">Mailbox unlocked! Parcel collected.</span>').fadeIn(150);
    } else {
      practiceTries--;
      if (practiceTries <= 0) {
        $('#stage-led').removeClass('led-green led-amber').addClass('led-red');
        if (!$('#practice-alert').length) {
          $('#mailbox-stage-box').append('<div class="stage-alert" id="practice-alert"></div>');
        }
        $('#btn-practice-collect').prop('disabled', true);
        $msg.html('<span class="text-danger fw-semibold">Too many wrong tries. The mailbox is locked.</span>').fadeIn(150);
      } else {
        $msg.html('<span class="text-danger">Wrong code. ' + practiceTries + ' tries left.</span>').fadeIn(150);
      }
    }
  });

  // Reset demo
  $('#btn-practice-reset').on('click', function (e) {
    e.preventDefault();
    isDropped = false; isLocked = false; practicePassCode = ''; practiceTries = 3;
    $('.practice-step-item').removeClass('done active');
    $('.practice-step-item[data-step="1"]').addClass('active');
    $('.practice-panel').hide();
    $('#practice-step-1').show();
    $('#practice-parcel').stop(true, true).css({ left: '35.4167%', top: '38.3333%', opacity: 1 }).hide();
    $('#stage-led').removeClass('led-green led-amber led-red');
    $('#practice-alert').remove();
    $('.practice-track-node').removeClass('active done');
    $('#track-node-1').addClass('active');
    $('.track-line').css('background', '#e5e8e5');
    $('#practice-sentence').text("It's on its way to your mailbox.");
    $('#btn-practice-lock').prop('disabled', true);
    $('#btn-practice-collect').prop('disabled', false);
    $('#generated-code-box, #step-1-next, #step-2-next, #practice-collect-msg').hide();
    $('#practice-input-code, #practice-name').val('');
  });
});
