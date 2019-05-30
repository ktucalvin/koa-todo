/* eslint-env jquery */
'use strict'
$(function () {
  let isLoggingIn = true
  $('#login-tab-btn').click(function () {
    $(this).removeClass('unselected')
    $('#register-tab-btn').addClass('unselected')
    $('#register-confirm').addClass('hidden')
    $('#password').css('margin-bottom', '0')
    $('.error-text').text('\xA0')
    isLoggingIn = true
  })

  $('#register-tab-btn').click(function () {
    $(this).removeClass('unselected')
    $('#login-tab-btn').addClass('unselected')
    $('#register-confirm').removeClass('hidden')
    $('#password').css('margin-bottom', '1em')
    $('.error-text').text('\xA0')
    isLoggingIn = false
  })

  $('#login-form').submit(function (e) {
    e.preventDefault()
    $('#password-err').text('\xA0')
    if (isLoggingIn) {
      $('#loader').show()
      $.post('/api/auth/login', $(this).serialize())
        .then(res => {
          window.location.replace(res)
        })
        .catch(err => {
          if (err.status === 403) {
            $('#password-err').text('Invalid credentials.')
            $('#loader').hide()
          }
        })
    } else {
      if ($('#password').val() !== $('#confirm-password').val()) {
        $('#password-err').text('Passwords do not match')
        return
      }
      $('#loader').show()
      $.post('/api/auth/register', $(this).serialize())
        .then(res => {
          window.location.replace(res)
        })
    }
  })
})
