export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Board ID is required'
    });
  }

  // For development, return a board with some initial items
  return {
    board_id: id,
    notes: [{
      note_id: 'n-1',
      content: 'Welcome to your board!\nTry adding more notes and todo lists.',
      x_position: 100,
      y_position: 48,
      color: '#FFD700',
      width: 300,
      height: 300,
    }],
    todolists: [{
      list_id: 'l-1',
      title: 'Getting Started',
      tasks: [
        { task_id: '1', content: 'Add a new note', completed: false },
        { task_id: '2', content: 'Create a todo list', completed: false },
        { task_id: '3', content: 'Try panning and zooming', completed: false },
      ],
      x_position: 420,
      y_position: 48,
      width: 350,
      height: 300,
    }],
  };
});