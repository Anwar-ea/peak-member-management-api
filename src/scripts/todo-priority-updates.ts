import { AnyBulkWriteOperation } from 'mongoose';
import { ToDo, todoModel } from '../entities/to-do';

export async function reassignTodoPriorities(): Promise<{ message: string; usersUpdated: number }> {
  console.log('Starting priority reassignment for all users...');
  
  // Get all unique user IDs who have todos
  const userIds = await todoModel.distinct('userId');
  console.log(`Found ${userIds.length} users with todos`);
  
  let usersUpdated = 0;
  
  for (const userId of userIds) {
    // Get all todos for this user, sorted by creation date (newest first)
    const userTodos = await todoModel.find({ userId })
      .sort({ createdAt: -1 })
      .select('_id createdAt priority');
    
    console.log(`Processing ${userTodos.length} todos for user ${userId}`);
    
    // Update priorities: newest gets highest priority, oldest gets 0
    const bulkOps = userTodos.map<AnyBulkWriteOperation<ToDo>>((todo, index) => ({
      updateOne: {
        filter: { _id: todo._id },
        update: { priority: userTodos.length - 1 - index }
      }
    }));
    
    if (bulkOps.length > 0) {
      await todoModel.bulkWrite(bulkOps);
      usersUpdated++;
      console.log(`Updated priorities for user ${userId}: newest todo gets priority ${userTodos.length - 1}, oldest gets 0`);
    }
  }
  
  const message = `Priority reassignment completed. Updated todos for ${usersUpdated} users.`;
  console.log(message);
  return { message, usersUpdated };
}

