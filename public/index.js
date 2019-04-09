/* eslint-env jquery */
'use strict'

function createTodo (id, text) {
  const todo =
  `<li data-id="${id}">
    <button class="delete-task">X</button>
    <div contenteditable>${text}</div>
   </li>`
  $(todo).appendTo($('#todos'))
}

$(function () {
  $.get('/todo/all')
    .then(res => {
      const todos = JSON.parse(res)
      for (const key in todos) {
        createTodo(key, todos[key].task)
      }
    })

  $('#create-task').submit(function (e) {
    e.preventDefault()
    $.post('/todo/create', $(this).serialize())
      .then(id => {
        createTodo(id, $('#task').val())
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
