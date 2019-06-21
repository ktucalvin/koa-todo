/* eslint-env jquery */
'use strict'
$(function () {
  $.get('/todo/list')
    .then(res => {
      let $todos = ''
      for (const todo of res) {
        $todos +=
        `<li data-id="${todo.id}">
          <button class="delete-task">X</button>
          <div contenteditable>${todo.task}</div>
        </li>`
      }
      $('#todos').html($todos)
    })

  $('#create-task').submit(function (e) {
    e.preventDefault()
    $.ajax('/todo/create', {
      method: 'POST',
      data: $(this).serialize()
    })
      .then(id => {
        const todo =
              `<li data-id="${id}">
                <button class="delete-task">X</button>
                <div contenteditable>${$('#task').val()}</div>
               </li>`
        $(todo).appendTo($('#todos'))
        $('#task').val('')
      })
      .catch(() => console.log('create failed'))
  })

  $('#todos').on('blur', 'div[contenteditable]', function (e) {
    $.ajax({
      method: 'PATCH',
      url: `/todo/edit/${$(this).parent().attr('data-id')}`,
      data: { task: $(this).text() }
    })
  })

  $('#todos').on('click', '.delete-task', function (e) {
    $.ajax({
      method: 'DELETE',
      url: `/todo/delete/${$(this).parent().attr('data-id')}`
    })
      .then(() => $(this).parent().remove())
      .catch(() => console.log('delete failed'))
  })
})
