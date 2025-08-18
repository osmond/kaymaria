# Manual Test Cases

This document outlines manual test cases for verifying Kay Maria's core flows on desktop and mobile devices.

## Desktop

- **Home Dashboard**: Visit `/app` and confirm today's tasks list appears with overdue items highlighted.
- **Add Plant**: Use the **+** button to add a plant. Verify default care tasks are scheduled.
- **Complete Task**: Mark a task as done and ensure it moves to the plant's timeline with a confirmation message.
- **Filters**: Apply room or task-type filters and confirm the task list updates accordingly.
- **Theme Toggle**: Switch between light and dark modes in settings and confirm the preference persists on refresh.

## Mobile

- **Responsive Layout**: Load `/app` on a device or emulator at mobile width and confirm the layout adapts with the FAB in the lower-right.
- **Swipe Actions**: Swipe a task card left or right to reveal actions for completion, deferral, or edit.
- **Upcoming View**: Navigate to the Upcoming view and verify tasks due within the configured window appear grouped by plant.
- **Undo Completion**: After marking a task done, use the undo option to restore it.

