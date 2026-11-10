// Interactive 3-step practice flow with jQuery events, traversal, and effects (Module 3 jQuery)
$(document).ready(function () {
  let isDropped = false;
  let isLocked = false;
  let practicePassCode = ($('#practice-code-display').text() || '482910').replace(/\s+/g, '').trim() || '482910';
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
    $('#stage-parcel').fadeIn(200);
    $('#stage-led').removeClass('led-green led-red').addClass('led-amber');
    $('#btn-practice-lock').prop('disabled', false);
    $(this).prop('disabled', true);
  });

  // Step 1: Lock door and generate practice code
  $('#btn-practice-lock').on('click', function () {
    if (!isDropped || isLocked) return;
    isLocked = true;
    $('#track-line-2').css('background', '#1b7f4b');
    $('#track-node-3').addClass('active');
    $('#practice-sentence').text('The mailbox is locked. Safe inside.');
    $('#stage-led').removeClass('led-amber led-red').addClass('led-green');
    practicePassCode = Math.floor(100000 + Math.random() * 900000).toString();
    $('#practice-code-display').text(practicePassCode);
    $(this).prop('disabled', true);
    setTimeout(() => goToStep(2), 350);
  });

  // Step 2: Go to collection keypad
  $('#btn-practice-ready').on('click', function () {
    goToStep(3);
    $('#practice-keypad').trigger('focus');
  });

  // Step 3: Restrict keypad to digits only
  $('#practice-keypad').on('input', function () {
    const digitsOnly = ($(this).val() || '').replace(/\D/g, '').slice(0, 6);
    if ($(this).val() !== digitsOnly) {
      $(this).val(digitsOnly);
    }
  });

  // Step 3: Verify 6-digit code with 3-attempt lockout
  $('#btn-practice-unlock').on('click', function () {
    const entered = ($('#practice-keypad').val() || '').trim().replace(/\D/g, '');
    const $result = $('#practice-result');
    if (entered.length !== 6) {
      $result.removeClass('text-success').addClass('text-danger').text('Enter a 6-digit code.');
      return;
    }

    if (entered === practicePassCode) {
      $('#track-line-3').css('background', '#1b7f4b');
      $('#track-node-4').addClass('active');
      $('#practice-sentence').text('Parcel picked up. Mailbox is empty.');
      $('#stage-led').removeClass('led-green led-amber led-red');
      $('#stage-alert').hide();
      $('#stage-parcel').fadeOut(250);
      $('#btn-practice-unlock').prop('disabled', true);
      $result.removeClass('text-danger').addClass('text-success').text('Mailbox unlocked! Parcel collected.');
    } else {
      practiceTries--;
      if (practiceTries <= 0) {
        $('#stage-led').removeClass('led-green led-amber').addClass('led-red');
        $('#stage-alert').fadeIn(150);
        $('#btn-practice-unlock').prop('disabled', true);
        $result.removeClass('text-success').addClass('text-danger').text('Too many wrong tries. The mailbox is locked.');
      } else {
        $result.removeClass('text-success').addClass('text-danger').text(`Wrong code. ${practiceTries} tries left.`);
      }
    }
  });

  // Step 3: Reset interactive practice demo
  $('#btn-practice-reset').on('click', function (e) {
    e.preventDefault();
    isDropped = false;
    isLocked = false;
    practiceTries = 3;
    practicePassCode = Math.floor(100000 + Math.random() * 900000).toString();
    $('#practice-code-display').text(practicePassCode);
    $('.practice-step-item').removeClass('done active');
    $('.practice-step-item[data-step="1"]').addClass('active');
    $('.practice-panel').hide();
    $('#practice-step-1').show();
    $('#stage-parcel').stop(true, true).show();
    $('#stage-led').removeClass('led-amber led-red').addClass('led-green');
    $('#stage-alert').hide();
    $('.practice-track-node').removeClass('active done');
    $('#track-node-1').addClass('active');
    $('.track-line').css('background', '#e5e8e5');
    $('#practice-sentence').text("It's on its way to your mailbox.");
    $('#btn-practice-drop').prop('disabled', false);
    $('#btn-practice-lock').prop('disabled', true);
    $('#btn-practice-unlock').prop('disabled', false);
    $('#practice-keypad').val('');
    $('#practice-result').removeClass('text-danger').addClass('text-success').text('');
  });
});
